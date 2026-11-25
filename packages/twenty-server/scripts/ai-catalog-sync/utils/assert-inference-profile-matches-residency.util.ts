import { DATA_RESIDENCY_BY_INFERENCE_PROFILE_PREFIX } from '../constants/data-residency-by-inference-profile-prefix.constant';
import { type CatalogSpecProvider } from '../types/catalog-spec.type';

export const assertInferenceProfileMatchesResidency = ({
  provider,
  modelName,
}: {
  provider: Pick<CatalogSpecProvider, 'name' | 'dataResidency'>;
  modelName: string;
}): void => {
  if (provider.dataResidency === undefined) {
    return;
  }

  const [prefix] = modelName.split('.');
  const profileResidency = DATA_RESIDENCY_BY_INFERENCE_PROFILE_PREFIX[prefix];

  if (
    profileResidency !== undefined &&
    profileResidency !== provider.dataResidency
  ) {
    throw new Error(
      `${provider.name}/${modelName} routes to "${profileResidency}" but its provider states "${provider.dataResidency}". Move it to a route with that residency.`,
    );
  }
};
