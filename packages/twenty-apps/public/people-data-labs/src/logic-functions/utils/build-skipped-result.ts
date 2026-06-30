import { type EnrichResult } from 'src/types/enrich-result';

export const buildSkippedResult = ({
  recordId,
  message,
}: {
  recordId: string;
  message: string;
}): EnrichResult => ({
  success: true,
  recordId,
  status: 'SKIPPED',
  updatedFields: [],
  message,
});
