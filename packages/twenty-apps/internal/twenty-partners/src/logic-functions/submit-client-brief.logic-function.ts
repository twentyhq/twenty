import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { z } from 'zod';

import {
  findOrCreateCompanyByName,
  findOrCreatePersonByEmail,
} from './find-or-create-company-and-person';

export const SUBMIT_CLIENT_BRIEF_LOGIC_FUNCTION_ID =
  'a8f3c2e1-9b4d-4a7f-8c6e-1d2f3a4b5c6d';

const HOSTING_LABEL: Record<'CLOUD' | 'SELF_HOSTING', string> = {
  CLOUD: 'Cloud',
  SELF_HOSTING: 'Self-hosting',
};

export const submitClientBriefSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string(),
  email: z.string().trim().email(),
  companyName: z.string().trim().min(1),
  need: z.string().trim().min(1),
  requirements: z.string().optional(),
  hostingType: z.enum(['CLOUD', 'SELF_HOSTING']).optional(),
  country: z.string().optional(),
  languages: z.array(z.string()).optional(),
  seatCount: z.string().optional(),
  timeline: z.string().optional(),
  budgetRange: z.string().optional(),
});

export type SubmitClientBriefInput = z.infer<typeof submitClientBriefSchema>;

export type SubmitClientBriefResult =
  | { ok: true; opportunityId: string }
  | { ok: false; reason: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function buildRequirementsText(input: SubmitClientBriefInput): string {
  const base = isNonEmptyString(input.requirements) ? input.requirements.trim() : '';
  const bullets: string[] = [];
  if (input.hostingType !== undefined) {
    bullets.push(`• Hosting: ${HOSTING_LABEL[input.hostingType]}`);
  }
  if (isNonEmptyString(input.seatCount)) bullets.push(`• Seats: ${input.seatCount.trim()}`);
  if (isNonEmptyString(input.country)) bullets.push(`• Country: ${input.country.trim()}`);
  if (input.languages !== undefined && input.languages.length > 0) {
    bullets.push(`• Languages: ${input.languages.join(', ')}`);
  }
  if (isNonEmptyString(input.timeline)) bullets.push(`• Timeline: ${input.timeline.trim()}`);
  if (isNonEmptyString(input.budgetRange)) bullets.push(`• Budget: ${input.budgetRange.trim()}`);
  if (bullets.length === 0) return base;
  const block = `---\nAdditional context:\n${bullets.join('\n')}`;
  return base ? `${base}\n\n${block}` : block;
}

type SubmitClientBriefEvent = {
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

const APPLICATION_SECRET_HEADER = 'x-application-secret';

export const handler = async (
  event: SubmitClientBriefEvent | SubmitClientBriefInput,
): Promise<SubmitClientBriefResult> => {
  const looksLikeEvent =
    typeof event === 'object' &&
    event !== null &&
    ('body' in event || 'headers' in event);

  const headers = looksLikeEvent
    ? (event as SubmitClientBriefEvent).headers ?? {}
    : {};
  const rawInput = looksLikeEvent
    ? (event as SubmitClientBriefEvent).body
    : event;

  const expectedSecret = process.env.PARTNER_APPLICATION_SECRET;
  if (!isNonEmptyString(expectedSecret)) {
    return { ok: false, reason: 'unauthorized' };
  }
  const providedSecret = headers[APPLICATION_SECRET_HEADER];
  if (providedSecret !== expectedSecret) {
    return { ok: false, reason: 'unauthorized' };
  }

  const parsed = submitClientBriefSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid_input' };
  }
  const input = parsed.data;

  try {
    const client = new CoreApiClient();
    const name = `${input.companyName.trim()} — marketplace brief`;
    const requirements = buildRequirementsText(input);

    const companyId = await findOrCreateCompanyByName(client, input.companyName);
    const pointOfContactId = await findOrCreatePersonByEmail(client, {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      companyId,
    });

    const opportunityData: CoreSchema.OpportunityCreateInput = {
      name,
      need: input.need,
      requirements,
      isListed: false,
      stage: 'NEW',
      companyId,
      pointOfContactId,
    };

    const result = await client.mutation({
      createOpportunity: { __args: { data: opportunityData }, id: true },
    });
    const opportunityId = result.createOpportunity?.id;
    if (opportunityId === undefined) {
      throw new Error('createOpportunity did not return an id');
    }

    return { ok: true, opportunityId };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
};

export default defineLogicFunction({
  universalIdentifier: SUBMIT_CLIENT_BRIEF_LOGIC_FUNCTION_ID,
  name: 'submit-client-brief',
  description: 'Create an unlisted Opportunity from the public marketplace brief form.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/client-briefs',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [APPLICATION_SECRET_HEADER],
  },
});
