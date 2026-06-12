import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MEETING_BOT_AUTO_RECORD_ENABLED_FIELD_UNIVERSAL_IDENTIFIER } from '@/settings/accounts/constants/MeetingBotAutoRecordEnabledFieldUniversalIdentifier';

export const findMeetingBotAutoRecordEnabledFieldMetadataItem = (
  objectMetadataItem: ObjectMetadataItem,
): FieldMetadataItem | undefined =>
  objectMetadataItem.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.universalIdentifier ===
        MEETING_BOT_AUTO_RECORD_ENABLED_FIELD_UNIVERSAL_IDENTIFIER &&
      fieldMetadataItem.isActive,
  );
