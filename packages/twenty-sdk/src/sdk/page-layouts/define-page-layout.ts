import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type PageLayoutConfig } from '@/sdk/page-layouts/page-layout-config';

export const definePageLayout: DefineEntity<PageLayoutConfig> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('PageLayout must have a universalIdentifier');
  }

  if (!config.name) {
    errors.push('PageLayout must have a name');
  }

  if (config.tabs) {
    for (const tab of config.tabs) {
      if (!tab.universalIdentifier) {
        errors.push('PageLayoutTab must have a universalIdentifier');
      }
      if (!tab.title) {
        errors.push('PageLayoutTab must have a title');
      }

      if (tab.widgets) {
        for (const widget of tab.widgets) {
          if (!widget.universalIdentifier) {
            errors.push('PageLayoutWidget must have a universalIdentifier');
          }
          if (!widget.title) {
            errors.push('PageLayoutWidget must have a title');
          }
          if (!widget.type) {
            errors.push('PageLayoutWidget must have a type');
          }
        }
      }
    }
  }

  return createValidationResult({ config, errors });
};
