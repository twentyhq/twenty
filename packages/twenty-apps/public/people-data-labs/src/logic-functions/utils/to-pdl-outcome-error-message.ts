import { PDL_ACCESS_ERROR_MESSAGE } from 'src/constants/pdl-access-error-message';
import { isPdlAccountErrorOutcome } from 'src/logic-functions/utils/is-pdl-account-error-outcome';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { isDefined } from 'src/utils/is-defined';

const NO_RESPONSE_MESSAGE =
  'People Data Labs returned no response for this record.';

type PdlErrorOutcome = Extract<PdlEnrichResult<unknown>, { outcome: 'error' }>;

export const toPdlOutcomeErrorMessage = (
  enrichmentOutcome: PdlErrorOutcome | undefined,
): string => {
  if (!isDefined(enrichmentOutcome)) {
    return NO_RESPONSE_MESSAGE;
  }

  return isPdlAccountErrorOutcome(enrichmentOutcome)
    ? PDL_ACCESS_ERROR_MESSAGE
    : enrichmentOutcome.message;
};
