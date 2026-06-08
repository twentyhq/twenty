import { extractRecordIds } from 'src/logic-functions/utils/extract-record-ids';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input.type';
import { type BulkEnrichResult } from 'src/types/bulk-enrich-result.type';
import { type EnrichResult } from 'src/types/enrich-result.type';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const runBulkEnrichment = async ({
  input,
  enrichRecord,
}: {
  input: BulkEnrichInput;
  enrichRecord: (recordId: string) => Promise<EnrichResult>;
}): Promise<BulkEnrichResult> => {
  const recordIds = extractRecordIds(input.records);
  const results: EnrichResult[] = [];

  for (const recordId of recordIds) {
    try {
      results.push(await enrichRecord(recordId));
    } catch (error) {
      results.push({
        success: false,
        recordId,
        status: 'ERROR',
        updatedFields: [],
        message: 'People Data Labs enrichment failed.',
        error: toErrorMessage(error),
      });
    }
  }

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
