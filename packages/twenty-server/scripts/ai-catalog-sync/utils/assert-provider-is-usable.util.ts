// By source path: the consuming repo runs this from a sparse checkout where 'twenty-shared/ai' does not resolve
import { isAiSdkPackage } from '../../../../twenty-shared/src/ai/utils/is-ai-sdk-package.util';
import { isDataResidency } from '../../../../twenty-shared/src/ai/utils/is-data-residency.util';

import { type CatalogSpecProvider } from '../types/catalog-spec.type';

export const assertProviderIsUsable = ({
  provider,
  seenNames,
  shouldRequireDataPolicyOnEveryRoute,
}: {
  provider: Pick<
    CatalogSpecProvider,
    'name' | 'npm' | 'dataResidency' | 'zeroDataRetention'
  >;
  seenNames: Set<string>;
  shouldRequireDataPolicyOnEveryRoute: boolean;
}): void => {
  // Providers key an object, so a repeat would drop the first one's credentials and models, and `__proto__` its own
  if (seenNames.has(provider.name) || provider.name === '__proto__') {
    throw new Error(`Provider "${provider.name}" is repeated or reserved`);
  }

  if (!isAiSdkPackage(provider.npm)) {
    throw new Error(
      `Provider "${provider.name}" names an unsupported SDK package: ${provider.npm}`,
    );
  }

  if (
    provider.dataResidency !== undefined &&
    !isDataResidency(provider.dataResidency)
  ) {
    throw new Error(
      `Provider "${provider.name}" names an unsupported data residency: ${provider.dataResidency}`,
    );
  }

  if (
    shouldRequireDataPolicyOnEveryRoute &&
    (provider.dataResidency === undefined ||
      provider.zeroDataRetention === undefined)
  ) {
    throw new Error(
      `Provider "${provider.name}" must state both dataResidency and zeroDataRetention`,
    );
  }
};
