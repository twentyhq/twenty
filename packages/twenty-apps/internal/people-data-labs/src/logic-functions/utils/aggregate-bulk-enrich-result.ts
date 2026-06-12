import { type BulkEnrichResult } from 'src/types/bulk-enrich-result';
import { type EnrichResult } from 'src/types/enrich-result';

export const aggregateBulkEnrichResult = (
  results: EnrichResult[],
): BulkEnrichResult => {
  const countByStatus = (status: EnrichResult['status']): number =>
    results.filter((result) => result.status === status).length;

  const errored = countByStatus('ERROR');

  return {
    success: errored === 0,
    total: results.length,
    matched: countByStatus('MATCHED'),
    notFound: countByStatus('NOT_FOUND'),
    skipped: countByStatus('SKIPPED'),
    errored,
    results,
  };
};
