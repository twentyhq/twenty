import { type EnrichResult } from 'src/types/enrich-result';

export const buildMatchedResult = ({
  recordId,
  updatedFields,
  data,
}: {
  recordId: string;
  updatedFields: string[];
  data?: Record<string, unknown>;
}): EnrichResult => ({
  success: true,
  recordId,
  status: 'MATCHED',
  updatedFields,
  data,
  message:
    updatedFields.length > 0
      ? `Enriched with People Data Labs (${updatedFields.length} fields).`
      : 'Matched People Data Labs data; no fields updated.',
});
