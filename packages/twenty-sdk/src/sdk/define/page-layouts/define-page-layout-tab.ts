import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type PageLayoutTabConfig } from '@/sdk/define/page-layouts/page-layout-tab-config';
import { validatePageLayoutTabWidgets } from '@/sdk/define/page-layouts/validate-page-layout-tab-widgets';

export const definePageLayoutTab: DefineEntity<PageLayoutTabConfig> = (
  config,
) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('PageLayoutTab must have a universalIdentifier');
  }

  if (!config.title) {
    errors.push('PageLayoutTab must have a title');
  }

  if (!config.pageLayoutUniversalIdentifier) {
    errors.push(
      'PageLayoutTab must have a pageLayoutUniversalIdentifier when defined standalone (use the parent page layout universalIdentifier)',
    );
  }

  errors.push(...validatePageLayoutTabWidgets(config));

  return createValidationResult({ config, errors });
};
