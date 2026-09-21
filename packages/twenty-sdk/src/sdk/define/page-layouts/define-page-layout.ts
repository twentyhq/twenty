import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type PageLayoutConfig } from '@/sdk/define/page-layouts/page-layout-config';
import { validatePageLayoutWidget } from '@/sdk/define/page-layouts/validate-page-layout-widget';

export const definePageLayout: DefineEntity<PageLayoutConfig> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('PageLayout must have a universalIdentifier');
  }

  if (!config.name) {
    errors.push('PageLayout must have a name');
  }

  if (!config.type) {
    errors.push('PageLayout must have a type');
  }

  for (const tab of config.tabs ?? []) {
    if (!tab.universalIdentifier) {
      errors.push('PageLayoutTab must have a universalIdentifier');
    }
    if (!tab.title) {
      errors.push('PageLayoutTab must have a title');
    }

    for (const widget of tab.widgets ?? []) {
      errors.push(...validatePageLayoutWidget(widget));
    }
  }

  return createValidationResult({ config, errors });
};
