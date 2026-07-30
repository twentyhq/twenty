import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const CALENDAR_FIELD_METADATA_TYPES = [
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
] as const;

export const groupCalendarFieldMetadataItemsByType = <
  T extends Pick<FieldMetadataItem, 'type'>,
>(
  fieldMetadataItems: T[],
) =>
  CALENDAR_FIELD_METADATA_TYPES.map((fieldMetadataType) => ({
    label: SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[fieldMetadataType].label,
    fields: fieldMetadataItems.filter(
      (fieldMetadataItem) => fieldMetadataItem.type === fieldMetadataType,
    ),
  })).filter((group) => group.fields.length > 0);
