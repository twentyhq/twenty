import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type RelatedRecordPathManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const defineRelatedRecordPath: DefineEntity<RelatedRecordPathManifest> = (
  config,
) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('Related record path must have a universalIdentifier');
  }

  if (!config.objectUniversalIdentifier) {
    errors.push('Related record path must have an objectUniversalIdentifier');
  }

  if (!config.firstFieldMetadataUniversalIdentifier) {
    errors.push(
      'Related record path must have a firstFieldMetadataUniversalIdentifier',
    );
  }

  if (
    isDefined(config.thirdFieldMetadataUniversalIdentifier) &&
    !isDefined(config.secondFieldMetadataUniversalIdentifier)
  ) {
    errors.push('Related record path cannot skip its second relation');
  }

  return createValidationResult({ config, errors });
};
