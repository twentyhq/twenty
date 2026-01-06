import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

type FieldMetadataItemSettings = FieldMetadataItem['settings'];

type SettingsWithJunctionTargetFieldId =
  NonNullable<FieldRelationMetadataSettings> & {
    junctionTargetFieldId: string;
  };

type SettingsWithJunctionTargetMorphId =
  NonNullable<FieldRelationMetadataSettings> & {
    junctionTargetMorphId: string;
  };

// Type guard to check if settings has junctionTargetFieldId (for regular relations)
export const hasJunctionTargetFieldId = (
  settings:
    | FieldMetadataItemSettings
    | FieldRelationMetadataSettings
    | undefined,
): settings is SettingsWithJunctionTargetFieldId => {
  if (!isDefined(settings) || typeof settings !== 'object') {
    return false;
  }

  return (
    'junctionTargetFieldId' in settings &&
    isDefined(settings.junctionTargetFieldId) &&
    typeof settings.junctionTargetFieldId === 'string' &&
    settings.junctionTargetFieldId.length > 0
  );
};

// Type guard to check if settings has junctionTargetMorphId (for morph relations)
export const hasJunctionTargetMorphId = (
  settings:
    | FieldMetadataItemSettings
    | FieldRelationMetadataSettings
    | undefined,
): settings is SettingsWithJunctionTargetMorphId => {
  if (!isDefined(settings) || typeof settings !== 'object') {
    return false;
  }

  return (
    'junctionTargetMorphId' in settings &&
    isDefined(settings.junctionTargetMorphId) &&
    typeof settings.junctionTargetMorphId === 'string' &&
    settings.junctionTargetMorphId.length > 0
  );
};

// Check if field has any junction configuration
export const hasJunctionConfig = (
  settings:
    | FieldMetadataItemSettings
    | FieldRelationMetadataSettings
    | undefined,
): boolean => {
  return (
    hasJunctionTargetFieldId(settings) || hasJunctionTargetMorphId(settings)
  );
};
