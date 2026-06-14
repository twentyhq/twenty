import { type BulkEnrichResult } from 'src/types/bulk-enrich-result';

export const buildEmptyToolResult = (): BulkEnrichResult => ({
  success: false,
  total: 0,
  matched: 0,
  notFound: 0,
  skipped: 0,
  errored: 0,
  results: [],
});
