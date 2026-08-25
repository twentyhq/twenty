import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';
import { type PageLayoutConfig } from '@/sdk/define/page-layouts/page-layout-config';
import { isDefined } from 'twenty-shared/utils';

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

          if (
            widget.configuration.configurationType === 'FRONT_COMPONENT' &&
            isDefined(
              widget.configuration.headerCommandMenuItemUniversalIdentifiers,
            )
          ) {
            const headerCommandMenuItemUniversalIdentifiers =
              widget.configuration.headerCommandMenuItemUniversalIdentifiers;

            for (const universalIdentifier of headerCommandMenuItemUniversalIdentifiers) {
              if (!isValidPostgresUuid(universalIdentifier)) {
                errors.push(
                  `PageLayoutWidget header command menu item universalIdentifier "${universalIdentifier}" must be a UUID`,
                );
              }
            }

            if (
              new Set(headerCommandMenuItemUniversalIdentifiers).size !==
              headerCommandMenuItemUniversalIdentifiers.length
            ) {
              errors.push(
                'PageLayoutWidget header command menu item universalIdentifiers must be unique',
              );
            }
          }
        }
      }
    }
  }

  return createValidationResult({ config, errors });
};
