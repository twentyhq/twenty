import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';

export const validatePageLayoutWidget = (
  widget: PageLayoutWidgetManifest,
): string[] => {
  const errors: string[] = [];

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
    widget.configuration?.configurationType === 'FRONT_COMPONENT' &&
    isDefined(widget.configuration.headerCommandMenuItemUniversalIdentifiers)
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

  return errors;
};
