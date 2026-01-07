import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

type FieldMetadataItemSettings = FieldMetadataItem['settings'];
type SettingsInput =
  | FieldMetadataItemSettings
  | FieldRelationMetadataSettings
  | undefined;

type SettingsWithJunctionTargetMorphId =
  NonNullable<FieldRelationMetadataSettings> & {
    junctionTargetMorphId: string;
  };

export const hasJunctionTargetMorphId = (
  settings: SettingsInput,
): settings is SettingsWithJunctionTargetMorphId => {
  if (!isDefined(settings) || typeof settings !== 'object') {
    return false;
  }
  return (
    'junctionTargetMorphId' in settings &&
    typeof settings.junctionTargetMorphId === 'string' &&
    settings.junctionTargetMorphId.length > 0
  );
};
