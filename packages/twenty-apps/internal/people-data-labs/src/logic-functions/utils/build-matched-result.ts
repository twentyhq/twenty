import { type EnrichResult } from 'src/types/enrich-result';

export const buildMatchedResult = ({
  recordId,
  updatedFields,
}: {
  recordId: string;
  updatedFields: string[];
}): EnrichResult => ({
  success: true,
  recordId,
  status: 'MATCHED',
  updatedFields,
  message: `Enriched with People Data Labs (${updatedFields.length} fields).`,
});
