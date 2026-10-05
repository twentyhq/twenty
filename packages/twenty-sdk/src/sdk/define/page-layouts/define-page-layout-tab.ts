import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type PageLayoutTabConfig } from '@/sdk/define/page-layouts/page-layout-tab-config';
import { validatePageLayoutWidget } from '@/sdk/define/page-layouts/validate-page-layout-widget';

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

  for (const widget of config.widgets ?? []) {
    errors.push(...validatePageLayoutWidget(widget));
  }

  return createValidationResult({ config, errors });
};
