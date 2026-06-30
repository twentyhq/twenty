import { type EnrichResult } from 'src/types/enrich-result';

export const buildNotFoundResult = (recordId: string): EnrichResult => ({
  success: true,
  recordId,
  status: 'NOT_FOUND',
  updatedFields: [],
  message: 'People Data Labs returned no confident match.',
});
