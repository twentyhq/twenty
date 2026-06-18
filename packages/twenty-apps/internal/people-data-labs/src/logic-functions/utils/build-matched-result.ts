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
  message: `Enriched with People Data Labs (${updatedFields.length} fields).`,
});
