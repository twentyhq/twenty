import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

type FieldMetadataItemSettings = FieldMetadataItem['settings'];
type SettingsInput =
  | FieldMetadataItemSettings
  | FieldRelationMetadataSettings
  | undefined;

type SettingsWithJunctionTargetFieldId =
  NonNullable<FieldRelationMetadataSettings> & {
    junctionTargetFieldId: string;
  };

export const hasJunctionTargetFieldId = (
  settings: SettingsInput,
): settings is SettingsWithJunctionTargetFieldId => {
  if (!isDefined(settings) || typeof settings !== 'object') {
    return false;
  }
  const value = (settings as Record<string, unknown>).junctionTargetFieldId;
  return typeof value === 'string' && value.length > 0;
};

