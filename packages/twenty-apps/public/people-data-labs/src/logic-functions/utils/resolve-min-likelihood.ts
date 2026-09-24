import applicationConfig from 'src/application-config';
import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const MIN_LIKELIHOOD = 1;
const MAX_LIKELIHOOD = 10;

const isValidLikelihood = (minLikelihood: number): boolean =>
  Number.isInteger(minLikelihood) &&
  minLikelihood >= MIN_LIKELIHOOD &&
  minLikelihood <= MAX_LIKELIHOOD;

const getConfiguredMinLikelihood = (variableName: string): number => {
  const variable = applicationConfig.config.applicationVariables?.[variableName];
  const defaultValue =
    isDefined(variable) && 'value' in variable ? variable.value : undefined;
  const minLikelihood = Number(toText(process.env[variableName]) ?? defaultValue);

  if (!isValidLikelihood(minLikelihood)) {
    throw new PdlConfigError(
      `${variable?.label ?? variableName} must be an integer between ${MIN_LIKELIHOOD} and ${MAX_LIKELIHOOD}.`,
    );
  }

  return minLikelihood;
};

export const resolveMinLikelihood = ({
  inputMinLikelihood,
  inputWeakIdentifierMinLikelihood,
  minLikelihoodVariableName,
  hasStrongIdentifier,
}: {
  inputMinLikelihood: number | null | undefined;
  inputWeakIdentifierMinLikelihood?: number | null;
  minLikelihoodVariableName:
    | 'PDL_PERSON_MIN_LIKELIHOOD'
    | 'PDL_COMPANY_MIN_LIKELIHOOD';
  hasStrongIdentifier: boolean;
}): number => {
  const hasInputMinLikelihood = isDefined(inputMinLikelihood);

  if (hasInputMinLikelihood && !isValidLikelihood(inputMinLikelihood)) {
    throw new PdlInvalidInputError(
      `Minimum likelihood must be an integer between ${MIN_LIKELIHOOD} and ${MAX_LIKELIHOOD}.`,
    );
  }

  if (
    isDefined(inputWeakIdentifierMinLikelihood) &&
    !isValidLikelihood(inputWeakIdentifierMinLikelihood)
  ) {
    throw new PdlInvalidInputError(
      `Minimum likelihood for name-based matches must be an integer between ${MIN_LIKELIHOOD} and ${MAX_LIKELIHOOD}.`,
    );
  }

  const minLikelihood =
    inputMinLikelihood ?? getConfiguredMinLikelihood(minLikelihoodVariableName);

  if (hasStrongIdentifier) {
    return minLikelihood;
  }

  const weakIdentifierMinLikelihoodVariableName =
    minLikelihoodVariableName === 'PDL_PERSON_MIN_LIKELIHOOD'
      ? 'PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD'
      : 'PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD';

  return Math.max(
    minLikelihood,
    inputWeakIdentifierMinLikelihood ??
      getConfiguredMinLikelihood(weakIdentifierMinLikelihoodVariableName),
  );
};
