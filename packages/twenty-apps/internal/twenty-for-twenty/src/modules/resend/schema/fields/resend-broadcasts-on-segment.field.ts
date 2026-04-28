import {
  RESEND_BROADCASTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEGMENT_ON_RESEND_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: RESEND_BROADCASTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'resendBroadcasts',
  label: 'Broadcasts',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEGMENT_ON_RESEND_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconSpeakerphone',
});
