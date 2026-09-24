import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { buildInvalidLikelihoodMessage } from 'src/logic-functions/utils/build-invalid-likelihood-message';
import { getConfiguredMinLikelihood } from 'src/logic-functions/utils/get-configured-min-likelihood';
import { isValidLikelihood } from 'src/logic-functions/utils/is-valid-likelihood';
import { type MinLikelihoodSettings } from 'src/types/min-likelihood-settings';
import { type MinLikelihoods } from 'src/types/min-likelihoods';
import { isDefined } from 'src/utils/is-defined';

export const resolveMinLikelihoods = ({
  input,
  minLikelihoodSettings,
}: {
  input: {
    minLikelihood?: number | null;
    weakIdentifierMinLikelihood?: number | null;
  };
  minLikelihoodSettings: MinLikelihoodSettings;
}): MinLikelihoods => {
  const inputMinLikelihood = input.minLikelihood;
  const inputWeakIdentifierMinLikelihood = input.weakIdentifierMinLikelihood;

  if (isDefined(inputMinLikelihood) && !isValidLikelihood(inputMinLikelihood)) {
    throw new PdlInvalidInputError(
      buildInvalidLikelihoodMessage('Minimum likelihood'),
    );
  }

  if (
    isDefined(inputWeakIdentifierMinLikelihood) &&
    !isValidLikelihood(inputWeakIdentifierMinLikelihood)
  ) {
    throw new PdlInvalidInputError(
      buildInvalidLikelihoodMessage(
        'Minimum likelihood for name-based matches',
      ),
    );
  }

  const strongIdentifierMinLikelihood =
    inputMinLikelihood ??
    getConfiguredMinLikelihood(minLikelihoodSettings.strongIdentifier);

  const weakIdentifierMinLikelihood =
    inputWeakIdentifierMinLikelihood ??
    inputMinLikelihood ??
    Math.max(
      strongIdentifierMinLikelihood,
      getConfiguredMinLikelihood(minLikelihoodSettings.weakIdentifier),
    );

  return { strongIdentifierMinLikelihood, weakIdentifierMinLikelihood };
};
