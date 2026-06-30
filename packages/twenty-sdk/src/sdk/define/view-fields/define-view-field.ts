import { type StandaloneViewFieldManifest } from 'twenty-shared/application';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

export const defineViewField: DefineEntity<StandaloneViewFieldManifest> = (
  config,
) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('View field must have a universalIdentifier');
  }

  if (!config.viewUniversalIdentifier) {
    errors.push('View field must have a viewUniversalIdentifier');
  }

  if (!config.fieldMetadataUniversalIdentifier) {
    errors.push('View field must have a fieldMetadataUniversalIdentifier');
  }

  return createValidationResult({ config, errors });
};
