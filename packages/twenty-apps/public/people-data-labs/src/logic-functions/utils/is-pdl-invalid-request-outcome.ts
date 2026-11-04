import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

const PDL_INVALID_REQUEST_HTTP_STATUS = 400;

export const isPdlInvalidRequestOutcome = <TData>(
  enrichmentOutcome: PdlEnrichResult<TData> | undefined,
): enrichmentOutcome is Extract<PdlEnrichResult<TData>, { outcome: 'error' }> =>
  enrichmentOutcome?.outcome === 'error' &&
  enrichmentOutcome.httpStatus === PDL_INVALID_REQUEST_HTTP_STATUS;
