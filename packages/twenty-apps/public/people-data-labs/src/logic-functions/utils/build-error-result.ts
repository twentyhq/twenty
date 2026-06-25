import { type EnrichResult } from 'src/types/enrich-result';

export const ENRICHMENT_FAILED_MESSAGE = 'People Data Labs enrichment failed.';

export const buildErrorResult = ({
  recordId,
  error,
}: {
  recordId: string;
  error: string;
}): EnrichResult => ({
  success: false,
  recordId,
  status: 'ERROR',
  updatedFields: [],
  message: ENRICHMENT_FAILED_MESSAGE,
  error,
});
