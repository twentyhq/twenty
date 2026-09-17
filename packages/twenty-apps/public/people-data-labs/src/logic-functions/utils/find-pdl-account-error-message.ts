import { PDL_ACCOUNT_ERROR_HTTP_STATUSES } from 'src/constants/pdl-account-error-http-statuses';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

type PdlErrorOutcome = Extract<PdlEnrichResult<unknown>, { outcome: 'error' }>;

export const findPdlAccountErrorMessage = <TData>(
  enrichmentOutcomes: PdlEnrichResult<TData>[],
): string | undefined => {
  const accountErrorOutcomes = enrichmentOutcomes.filter(
    (enrichmentOutcome): enrichmentOutcome is PdlErrorOutcome =>
      enrichmentOutcome?.outcome === 'error' &&
      PDL_ACCOUNT_ERROR_HTTP_STATUSES.has(enrichmentOutcome.httpStatus),
  );

  const isEveryOutcomeAnAccountError =
    accountErrorOutcomes.length > 0 &&
    accountErrorOutcomes.length === enrichmentOutcomes.length;

  return isEveryOutcomeAnAccountError
    ? accountErrorOutcomes[0].message
    : undefined;
};
