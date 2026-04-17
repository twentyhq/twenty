import { RESEND_EMAILS_ON_BROADCAST_ID } from 'src/modules/resend/fields/resend-emails-on-broadcast.field';
import { RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-broadcast';
import { RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-email';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const BROADCAST_ON_RESEND_EMAIL_ID =
  '4cd54c84-1e3e-4d3f-a35d-b32a6e8e1137';

export default defineField({
  universalIdentifier: BROADCAST_ON_RESEND_EMAIL_ID,
  objectUniversalIdentifier: RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'broadcast',
  label: 'Broadcast',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_EMAILS_ON_BROADCAST_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'broadcastId',
  },
  icon: 'IconSpeakerphone',
});
