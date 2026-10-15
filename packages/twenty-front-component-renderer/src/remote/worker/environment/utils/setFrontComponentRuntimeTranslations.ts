import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { FRONT_COMPONENT_TRANSLATIONS_KEY } from 'twenty-sdk/front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

let runtimeCatalogs: Record<string, Record<string, string>> | undefined;

export const setFrontComponentRuntimeTranslations = (
  context: FrontComponentExecutionContext,
): void => {
  const globalScope = toGlobalScopeRecord(globalThis);
  const currentCatalogs = globalScope[FRONT_COMPONENT_TRANSLATIONS_KEY];

  // Older bundles replace this global with catalogs matching their own code.
  if (isDefined(currentCatalogs) && currentCatalogs !== runtimeCatalogs) {
    return;
  }
  if (!isDefined(context.locale) || !isDefined(context.translationCatalog)) {
    return;
  }

  runtimeCatalogs = { [context.locale]: context.translationCatalog };
  globalScope[FRONT_COMPONENT_TRANSLATIONS_KEY] = runtimeCatalogs;
};
