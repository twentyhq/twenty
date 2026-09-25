import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { buildInvalidLikelihoodMessage } from 'src/logic-functions/utils/build-invalid-likelihood-message';
import { isValidLikelihood } from 'src/logic-functions/utils/is-valid-likelihood';
import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

export const getConfiguredMinLikelihood = ({
  envVarName,
  defaultValue,
}: {
  envVarName: string;
  defaultValue: number;
}): number => {
  const configuredMinLikelihood = toText(process.env[envVarName]);

  if (!isDefined(configuredMinLikelihood)) {
    return defaultValue;
  }

  const minLikelihood = Number(configuredMinLikelihood);

  if (!isValidLikelihood(minLikelihood)) {
    throw new PdlConfigError(
      buildInvalidLikelihoodMessage('Each minimum likelihood setting'),
    );
  }

  return minLikelihood;
};
