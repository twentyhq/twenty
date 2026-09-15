import { type CoreSchema } from 'twenty-client-sdk/core';
import { z } from 'zod';

import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

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
  useCase: z.string().optional(),
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

export function mapToOpportunityCreateInput(
  input: ImportOpportunityFromTftInput,
  refs: { companyId: string | undefined; pointOfContactId: string | undefined },
): CoreSchema.OpportunityCreateInput {
  const name = input.name.trim();
  const tftOpportunityId = isNonEmptyString(input.tftOpportunityId)
    ? input.tftOpportunityId.trim()
    : undefined;

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
  if (isNonEmptyString(input.useCase)) {
    opportunityData.need = input.useCase.trim();
  }
  if (refs.companyId !== undefined) opportunityData.companyId = refs.companyId;
  if (refs.pointOfContactId !== undefined) {
    opportunityData.pointOfContactId = refs.pointOfContactId;
  }
  return opportunityData;
}
