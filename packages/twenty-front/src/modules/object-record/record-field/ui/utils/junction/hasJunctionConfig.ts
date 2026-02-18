import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { hasJunctionTargetFieldId } from './hasJunctionTargetFieldId';

type FieldMetadataItemSettings = FieldMetadataItem['settings'];
type SettingsInput =
  | FieldMetadataItemSettings
  | FieldRelationMetadataSettings
  | undefined;

export const hasJunctionConfig = (settings: SettingsInput): boolean =>
  hasJunctionTargetFieldId(settings);
