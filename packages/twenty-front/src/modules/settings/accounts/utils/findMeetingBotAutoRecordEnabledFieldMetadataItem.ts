import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { MEETING_BOT_AUTO_RECORD_ENABLED_FIELD_UNIVERSAL_IDENTIFIER } from '@/settings/accounts/constants/MeetingBotAutoRecordEnabledFieldUniversalIdentifier';

export const findMeetingBotAutoRecordEnabledFieldMetadataItem = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): FieldMetadataItem | undefined =>
  objectMetadataItem.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.universalIdentifier ===
        MEETING_BOT_AUTO_RECORD_ENABLED_FIELD_UNIVERSAL_IDENTIFIER &&
      fieldMetadataItem.isActive,
  );
