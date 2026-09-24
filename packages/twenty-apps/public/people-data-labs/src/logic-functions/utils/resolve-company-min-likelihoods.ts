import { MIN_LIKELIHOOD_SETTINGS } from 'src/constants/min-likelihood-settings';
import { resolveMinLikelihoods } from 'src/logic-functions/utils/resolve-min-likelihoods';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type MinLikelihoods } from 'src/types/min-likelihoods';

export const resolveCompanyMinLikelihoods = ({
  input,
}: {
  input: BulkEnrichInput;
}): MinLikelihoods =>
  resolveMinLikelihoods({
    input,
    minLikelihoodSettings: MIN_LIKELIHOOD_SETTINGS.company,
  });
