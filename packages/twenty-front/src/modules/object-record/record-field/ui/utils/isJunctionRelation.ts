import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

type FieldMetadataItemSettings = FieldMetadataItem['settings'];

type SettingsWithJunctionFieldIds =
  NonNullable<FieldRelationMetadataSettings> & {
    junctionTargetRelationFieldIds: string[];
  };

type SettingsWithJunctionMorphId =
  NonNullable<FieldRelationMetadataSettings> & {
    junctionMorphId: string;
  };

// Type guard to check if settings has junctionTargetRelationFieldIds (for regular relations)
export const hasJunctionTargetRelationFieldIds = (
  settings:
    | FieldMetadataItemSettings
    | FieldRelationMetadataSettings
    | undefined,
): settings is SettingsWithJunctionFieldIds => {
  if (!isDefined(settings) || typeof settings !== 'object') {
    return false;
  }

  return (
    'junctionTargetRelationFieldIds' in settings &&
    isDefined(settings.junctionTargetRelationFieldIds) &&
    Array.isArray(settings.junctionTargetRelationFieldIds) &&
    settings.junctionTargetRelationFieldIds.length > 0
  );
};

// Type guard to check if settings has junctionMorphId (for morph relations)
export const hasJunctionMorphId = (
  settings:
    | FieldMetadataItemSettings
    | FieldRelationMetadataSettings
    | undefined,
): settings is SettingsWithJunctionMorphId => {
  if (!isDefined(settings) || typeof settings !== 'object') {
    return false;
  }

  return (
    'junctionMorphId' in settings &&
    isDefined(settings.junctionMorphId) &&
    typeof settings.junctionMorphId === 'string' &&
    settings.junctionMorphId.length > 0
  );
};

// Check if field has any junction configuration (either morphId or fieldIds)
export const hasJunctionConfig = (
  settings:
    | FieldMetadataItemSettings
    | FieldRelationMetadataSettings
    | undefined,
): boolean => {
  return (
    hasJunctionTargetRelationFieldIds(settings) || hasJunctionMorphId(settings)
  );
};
