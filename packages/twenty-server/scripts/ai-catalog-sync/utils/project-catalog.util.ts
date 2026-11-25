import { PROVIDER_CREDENTIAL_FIELDS } from '../constants/provider-credential-fields.constant';
import { type CanonicalCatalog } from '../types/canonical-catalog.type';
import { type CatalogSpec } from '../types/catalog-spec.type';
import { applySpecToCanonicalModel } from './apply-spec-to-canonical-model.util';
import { assertProviderIsUsable } from './assert-provider-is-usable.util';
import { indexCanonicalModels } from './index-canonical-models.util';
import { resolveProviderModels } from './resolve-provider-models.util';

export const projectCatalog = ({
  canonicalCatalog,
  spec,
}: {
  canonicalCatalog: CanonicalCatalog;
  spec: CatalogSpec;
}): CanonicalCatalog => {
  const canonicalModels = indexCanonicalModels(canonicalCatalog);
  const projected: CanonicalCatalog = {};
  const seenNames = new Set<string>();

  for (const provider of spec.providers) {
    assertProviderIsUsable({
      provider,
      seenNames,
      shouldRequireDataPolicyOnEveryRoute:
        spec.requireDataPolicyOnEveryRoute ?? false,
    });
    seenNames.add(provider.name);

    const credentials = Object.fromEntries(
      PROVIDER_CREDENTIAL_FIELDS.filter(
        (field) => provider[field] !== undefined,
      ).map((field) => [field, provider[field]]),
    );

    projected[provider.name] = {
      npm: provider.npm,
      label: provider.label ?? provider.name,
      ...credentials,
      models: resolveProviderModels({
        provider,
        canonicalCatalog,
        canonicalModels,
      }).map((resolved) =>
        applySpecToCanonicalModel({ ...resolved, provider }),
      ),
    };
  }

  return projected;
};
