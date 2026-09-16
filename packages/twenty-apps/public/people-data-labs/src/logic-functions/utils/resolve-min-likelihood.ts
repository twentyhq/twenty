import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { isDefined } from 'src/utils/is-defined';

const MIN_LIKELIHOOD = 1;
const MAX_LIKELIHOOD = 10;
const DEFAULT_MIN_LIKELIHOOD = 2;
const WEAK_IDENTIFIER_MIN_LIKELIHOOD = 6;

export const resolveMinLikelihood = ({
  inputMinLikelihood,
  hasStrongIdentifier,
}: {
  inputMinLikelihood: number | null | undefined;
  hasStrongIdentifier: boolean;
}): number => {
  if (!isDefined(inputMinLikelihood)) {
    return hasStrongIdentifier
      ? DEFAULT_MIN_LIKELIHOOD
      : WEAK_IDENTIFIER_MIN_LIKELIHOOD;
  }

  const isValidLikelihood =
    Number.isInteger(inputMinLikelihood) &&
    inputMinLikelihood >= MIN_LIKELIHOOD &&
    inputMinLikelihood <= MAX_LIKELIHOOD;

  if (!isValidLikelihood) {
    throw new PdlInvalidInputError(
      `Minimum likelihood must be an integer between ${MIN_LIKELIHOOD} and ${MAX_LIKELIHOOD}.`,
    );
  }

  return inputMinLikelihood;
};
