import { describe, expect, it } from 'vitest';

import { buildEnrichmentSnackbarParams } from 'src/front-components/utils/build-enrichment-snackbar-params';
import { aggregateBulkEnrichResult } from 'src/logic-functions/utils/aggregate-bulk-enrich-result';
import { buildErrorResult } from 'src/logic-functions/utils/build-error-result';
import { buildMatchedResult } from 'src/logic-functions/utils/build-matched-result';
import { buildNotFoundResult } from 'src/logic-functions/utils/build-not-found-result';

describe('buildEnrichmentSnackbarParams', () => {
  it('reports a success when no record failed', () => {
    expect(
      buildEnrichmentSnackbarParams(
        aggregateBulkEnrichResult([
          buildMatchedResult({ recordId: 'a', updatedFields: [] }),
          buildNotFoundResult('b'),
        ]),
      ),
    ).toEqual({ message: 'Enriched records.', variant: 'success' });
  });

  it('uses the singular form when a single record was enriched', () => {
    expect(
      buildEnrichmentSnackbarParams(
        aggregateBulkEnrichResult([
          buildMatchedResult({ recordId: 'a', updatedFields: [] }),
        ]),
      ),
    ).toEqual({ message: 'Enriched record.', variant: 'success' });
  });

  it('reports an error with the first record error when every record failed', () => {
    expect(
      buildEnrichmentSnackbarParams(
        aggregateBulkEnrichResult([
          buildErrorResult({ recordId: 'a', error: 'Invalid API key' }),
          buildErrorResult({ recordId: 'b', error: 'Invalid API key' }),
        ]),
      ),
    ).toEqual({
      message: 'Records enrichment failed',
      variant: 'error',
      detailedMessage: 'Invalid API key',
    });
  });

  it('reports a warning with the first record error when some records failed', () => {
    expect(
      buildEnrichmentSnackbarParams(
        aggregateBulkEnrichResult([
          buildMatchedResult({ recordId: 'a', updatedFields: [] }),
          buildErrorResult({ recordId: 'b', error: 'update failed' }),
          buildErrorResult({ recordId: 'c', error: 'build failed' }),
        ]),
      ),
    ).toEqual({
      message: 'Could not enrich 2 of 3 records.',
      variant: 'warning',
      detailedMessage: 'update failed',
    });
  });
});
