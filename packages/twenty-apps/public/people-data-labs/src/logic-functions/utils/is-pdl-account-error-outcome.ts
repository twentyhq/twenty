import { PDL_ACCOUNT_ERROR_HTTP_STATUSES } from 'src/constants/pdl-account-error-http-statuses';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

export const isPdlAccountErrorOutcome = <TData>(
  enrichmentOutcome: PdlEnrichResult<TData> | undefined,
): boolean =>
  enrichmentOutcome?.outcome === 'error' &&
  PDL_ACCOUNT_ERROR_HTTP_STATUSES.has(enrichmentOutcome.httpStatus);
