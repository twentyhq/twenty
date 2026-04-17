import { SEGMENT_ON_RESEND_BROADCAST_ID } from 'src/modules/resend/fields/segment-on-resend-broadcast.field';
import { RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-broadcast';
import { RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-segment';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const RESEND_BROADCASTS_ON_SEGMENT_ID =
  '784601f0-e892-4164-90db-6903ab062c7e';

export default defineField({
  universalIdentifier: RESEND_BROADCASTS_ON_SEGMENT_ID,
  objectUniversalIdentifier: RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'resendBroadcasts',
  label: 'Broadcasts',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEGMENT_ON_RESEND_BROADCAST_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconSpeakerphone',
});
