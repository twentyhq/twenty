import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { z } from 'zod';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// Manual one-way copy of one Opportunity from the TFT workspace into partners.
export const IMPORT_OPPORTUNITY_FROM_TFT_LOGIC_FUNCTION_ID =
  '4c220eaf-a23f-4af2-8d69-38a6c460019f';

const APPLICATION_SECRET_HEADER = 'x-application-secret';

// TFT POSTs `null` for empty fields; treat null as "field absent".
const dropNulls = (value: unknown): unknown =>
  value === null
    ? undefined
    : Array.isArray(value)
      ? value.map(dropNulls)
      : typeof value === 'object'
        ? Object.fromEntries(
            Object.entries(value).map(([key, val]) => [key, dropNulls(val)]),
          )
        : value;

// Request contract — the JSON the TFT workflow POSTs.
export const importOpportunityFromTftSchema = z.preprocess(dropNulls, z.object({
  tftOpportunityId: z.string().optional(),
  name: z.string().trim().min(1),
  amountMicros: z.number().optional(),
  currencyCode: z.string().optional(),
  closeDate: z.string().optional(),
  stage: z.string().optional(),
  company: z
    .object({
      name: z.string().optional(),
      domain: z.string().optional(),
    })
    .optional(),
  pointOfContact: z
    .object({
      email: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .optional(),
}));

export type ImportOpportunityFromTftInput = z.infer<
  typeof importOpportunityFromTftSchema
>;

type ImportOpportunityFromTftEvent = {
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

export type ImportOpportunityFromTftResult =
  | { ok: true; created: boolean; id: string }
  | { ok: false; reason: string };

// Find by exact name, else create.
async function findOrCreateCompanyId(
  client: CoreApiClient,
  company: ImportOpportunityFromTftInput['company'],
): Promise<string | undefined> {
  const name = isNonEmptyString(company?.name) ? company.name.trim() : undefined;
  const domain = isNonEmptyString(company?.domain) ? company.domain.trim() : undefined;
  if (name === undefined && domain === undefined) return undefined;

  if (name !== undefined) {
    const lookup = await client.query({
      companies: {
        __args: { filter: { name: { eq: name } }, first: 1 },
        edges: { node: { id: true } },
      },
    });
    const existing = lookup.companies?.edges?.[0]?.node;
    if (existing) return existing.id;
  }

  const companyData: CoreSchema.CompanyCreateInput = { name: name ?? domain! };
  if (domain !== undefined) companyData.domainName = { primaryLinkUrl: domain };

  const result = await client.mutation({
    createCompany: { __args: { data: companyData }, id: true },
  });
  const id = result.createCompany?.id;
  if (id === undefined) throw new Error('createCompany did not return an id');
  return id;
}

// Find by primary email, else create — name-only contacts can't be deduped.
async function findOrCreatePersonId(
  client: CoreApiClient,
  pointOfContact: ImportOpportunityFromTftInput['pointOfContact'],
  companyId: string | undefined,
): Promise<string | undefined> {
  const email = isNonEmptyString(pointOfContact?.email)
    ? pointOfContact.email.trim()
    : undefined;
  const firstName = isNonEmptyString(pointOfContact?.firstName)
    ? pointOfContact.firstName.trim()
    : '';
  const lastName = isNonEmptyString(pointOfContact?.lastName)
    ? pointOfContact.lastName.trim()
    : '';
  if (email === undefined && firstName === '' && lastName === '') return undefined;

  if (email !== undefined) {
    const lookup = await client.query({
      people: {
        __args: { filter: { emails: { primaryEmail: { eq: email } } }, first: 1 },
        edges: { node: { id: true } },
      },
    });
    const existing = lookup.people?.edges?.[0]?.node;
    if (existing) return existing.id;
  }

  const personData: CoreSchema.PersonCreateInput = { name: { firstName, lastName } };
  if (email !== undefined) personData.emails = { primaryEmail: email };
  if (companyId !== undefined) personData.companyId = companyId;

  const result = await client.mutation({
    createPerson: { __args: { data: personData }, id: true },
  });
  const id = result.createPerson?.id;
  if (id === undefined) throw new Error('createPerson did not return an id');
  return id;
}

export const handler = async (
  event: ImportOpportunityFromTftEvent | ImportOpportunityFromTftInput,
): Promise<ImportOpportunityFromTftResult> => {
  // HTTP event ({ body, headers }) or a flat input for direct calls.
  const looksLikeEvent =
    typeof event === 'object' &&
    event !== null &&
    ('body' in event || 'headers' in event);

  const headers = looksLikeEvent
    ? (event as ImportOpportunityFromTftEvent).headers ?? {}
    : {};
  const rawInput = looksLikeEvent
    ? (event as ImportOpportunityFromTftEvent).body
    : event;

  // isAuthRequired only accepts user JWTs, not API keys; guard with the shared secret.
  const expectedSecret = process.env.PARTNER_APPLICATION_SECRET;
  if (!isNonEmptyString(expectedSecret)) return { ok: false, reason: 'unauthorized' };
  if (headers[APPLICATION_SECRET_HEADER] !== expectedSecret) {
    return { ok: false, reason: 'unauthorized' };
  }

  const parsed = importOpportunityFromTftSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, reason: 'invalid_input' };
  const input = parsed.data;

  try {
    const client = new CoreApiClient();
    const name = input.name.trim();
    const tftOpportunityId = isNonEmptyString(input.tftOpportunityId)
      ? input.tftOpportunityId.trim()
      : undefined;

    // Idempotency: stable source id first, name as a fallback for manual calls.
    const dedupeFilter: CoreSchema.OpportunityFilterInput =
      tftOpportunityId !== undefined
        ? { tftOpportunityId: { eq: tftOpportunityId } }
        : { name: { eq: name } };
    const existing = await client.query({
      opportunities: {
        __args: { filter: dedupeFilter, first: 1 },
        edges: { node: { id: true } },
      },
    });
    const existingId = existing.opportunities?.edges?.[0]?.node?.id;
    if (existingId !== undefined) return { ok: true, created: false, id: existingId };

    const companyId = await findOrCreateCompanyId(client, input.company);
    const pointOfContactId = await findOrCreatePersonId(
      client,
      input.pointOfContact,
      companyId,
    );

    const opportunityData: CoreSchema.OpportunityCreateInput = { name };
    if (tftOpportunityId !== undefined) opportunityData.tftOpportunityId = tftOpportunityId;
    if (input.amountMicros !== undefined) {
      opportunityData.amount = {
        amountMicros: input.amountMicros,
        currencyCode: input.currencyCode ?? 'USD',
      };
    }
    if (isNonEmptyString(input.closeDate)) opportunityData.closeDate = input.closeDate;
    if (isNonEmptyString(input.stage)) {
      opportunityData.stage = input.stage as CoreSchema.OpportunityStageEnum;
    }
    if (companyId !== undefined) opportunityData.companyId = companyId;
    if (pointOfContactId !== undefined) opportunityData.pointOfContactId = pointOfContactId;

    const result = await client.mutation({
      createOpportunity: { __args: { data: opportunityData }, id: true },
    });
    const id = result.createOpportunity?.id;
    if (id === undefined) throw new Error('createOpportunity did not return an id');

    return { ok: true, created: true, id };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
};

export default defineLogicFunction({
  universalIdentifier: IMPORT_OPPORTUNITY_FROM_TFT_LOGIC_FUNCTION_ID,
  name: 'import-opportunity-from-tft',
  description:
    'Receive one opportunity pushed from the TFT workspace and create it in partners (find-or-create company + contact, idempotent on tftOpportunityId).',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/opportunities',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [APPLICATION_SECRET_HEADER],
  },
});
