import { type EnqueueSnackbarParams } from 'twenty-sdk/front-component';

import { type BulkEnrichResult } from 'src/types/bulk-enrich-result';
import { isDefined } from 'src/utils/is-defined';

export const buildEnrichmentSnackbarParams = ({
  total,
  errored,
  results,
}: BulkEnrichResult): EnqueueSnackbarParams => {
  if (errored === 0) {
    return {
      message: `Enriched ${total > 1 ? 'records.' : 'record.'}`,
      variant: 'success',
    };
  }

  const firstErrorMessage = results.find((result) =>
    isDefined(result.error),
  )?.error;

  if (errored === total) {
    return {
      message: 'Records enrichment failed',
      variant: 'error',
      detailedMessage: firstErrorMessage,
    };
  }

  return {
    message: `Could not enrich ${errored} of ${total} records.`,
    variant: 'warning',
    detailedMessage: firstErrorMessage,
  };
};
