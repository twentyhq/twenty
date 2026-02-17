import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type ViewConfig } from '@/sdk/views/view-config';

export const defineView: DefineEntity<ViewConfig> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('View must have a universalIdentifier');
  }

  if (!config.name) {
    errors.push('View must have a name');
  }

  if (!config.objectUniversalIdentifier) {
    errors.push('View must have an objectUniversalIdentifier');
  }

  if (config.fields) {
    for (const field of config.fields) {
      if (!field.universalIdentifier) {
        errors.push('ViewField must have a universalIdentifier');
      }
      if (!field.fieldMetadataUniversalIdentifier) {
        errors.push('ViewField must have a fieldMetadataUniversalIdentifier');
      }
    }
  }

  if (config.filters) {
    for (const filter of config.filters) {
      if (!filter.universalIdentifier) {
        errors.push('ViewFilter must have a universalIdentifier');
      }
      if (!filter.fieldMetadataUniversalIdentifier) {
        errors.push('ViewFilter must have a fieldMetadataUniversalIdentifier');
      }
    }
  }

  if (config.filterGroups) {
    for (const filterGroup of config.filterGroups) {
      if (!filterGroup.universalIdentifier) {
        errors.push('ViewFilterGroup must have a universalIdentifier');
      }
    }
  }

  if (config.groups) {
    for (const group of config.groups) {
      if (!group.universalIdentifier) {
        errors.push('ViewGroup must have a universalIdentifier');
      }
    }
  }

  if (config.fieldGroups) {
    for (const fieldGroup of config.fieldGroups) {
      if (!fieldGroup.universalIdentifier) {
        errors.push('ViewFieldGroup must have a universalIdentifier');
      }
    }
  }

  return createValidationResult({ config, errors });
};
