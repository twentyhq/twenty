import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const MIN_LIKELIHOOD = 1;
const MAX_LIKELIHOOD = 10;
const DEFAULT_MIN_LIKELIHOOD = 2;
const WEAK_IDENTIFIER_MIN_LIKELIHOOD = 6;

export const resolveMinLikelihood = ({
  inputMinLikelihood,
  defaultMinLikelihood,
  hasStrongIdentifier,
}: {
  inputMinLikelihood: number | null | undefined;
  defaultMinLikelihood?: string;
  hasStrongIdentifier: boolean;
}): number => {
  const configuredDefaultMinLikelihood = toText(defaultMinLikelihood);
  const minLikelihood =
    inputMinLikelihood ??
    (isDefined(configuredDefaultMinLikelihood)
      ? Number(configuredDefaultMinLikelihood)
      : undefined);

  if (!isDefined(minLikelihood)) {
    return hasStrongIdentifier
      ? DEFAULT_MIN_LIKELIHOOD
      : WEAK_IDENTIFIER_MIN_LIKELIHOOD;
  }

  const isValidLikelihood =
    Number.isInteger(minLikelihood) &&
    minLikelihood >= MIN_LIKELIHOOD &&
    minLikelihood <= MAX_LIKELIHOOD;

  if (isValidLikelihood) {
    return minLikelihood;
  }

  if (isDefined(inputMinLikelihood)) {
    throw new PdlInvalidInputError(
      `Minimum likelihood must be an integer between ${MIN_LIKELIHOOD} and ${MAX_LIKELIHOOD}.`,
    );
  }

  throw new PdlConfigError(
    `Default minimum likelihood must be an integer between ${MIN_LIKELIHOOD} and ${MAX_LIKELIHOOD}.`,
  );
};
