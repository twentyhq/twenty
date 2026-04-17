import { TEMPLATE_ON_RESEND_BROADCAST_ID } from 'src/modules/resend/fields/template-on-resend-broadcast.field';
import { RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-broadcast';
import { RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-template';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const RESEND_BROADCASTS_ON_TEMPLATE_ID =
  'd6a55959-3e16-4c40-854d-f08f6dd090e3';

export default defineField({
  universalIdentifier: RESEND_BROADCASTS_ON_TEMPLATE_ID,
  objectUniversalIdentifier: RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'resendBroadcasts',
  label: 'Broadcasts',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    TEMPLATE_ON_RESEND_BROADCAST_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconSpeakerphone',
});
