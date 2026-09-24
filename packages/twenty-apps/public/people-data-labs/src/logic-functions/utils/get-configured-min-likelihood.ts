import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { buildInvalidLikelihoodMessage } from 'src/logic-functions/utils/build-invalid-likelihood-message';
import { isValidLikelihood } from 'src/logic-functions/utils/is-valid-likelihood';
import { toText } from 'src/logic-functions/utils/to-text';
import { type MinLikelihoodSetting } from 'src/types/min-likelihood-setting';
import { isDefined } from 'src/utils/is-defined';

const DECIMAL_DIGITS_PATTERN = /^\d+$/;

export const getConfiguredMinLikelihood = ({
  variableName,
  label,
  defaultValue,
}: MinLikelihoodSetting): number => {
  const configuredMinLikelihood = toText(process.env[variableName]);

  if (!isDefined(configuredMinLikelihood)) {
    return defaultValue;
  }

  const minLikelihood = Number(configuredMinLikelihood);
  const isWrittenAsDecimalDigits = DECIMAL_DIGITS_PATTERN.test(
    configuredMinLikelihood,
  );

  if (!isWrittenAsDecimalDigits || !isValidLikelihood(minLikelihood)) {
    throw new PdlConfigError(buildInvalidLikelihoodMessage(label));
  }

  return minLikelihood;
};
