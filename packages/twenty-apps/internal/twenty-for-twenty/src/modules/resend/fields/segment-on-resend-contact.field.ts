import { RESEND_CONTACTS_ON_SEGMENT_ID } from 'src/modules/resend/fields/resend-contacts-on-segment.field';
import { RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-contact';
import { RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-segment';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const SEGMENT_ON_RESEND_CONTACT_ID =
  '5fbd9063-fb4e-4584-820b-27918b6f95f0';

export default defineField({
  universalIdentifier: SEGMENT_ON_RESEND_CONTACT_ID,
  objectUniversalIdentifier: RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'segment',
  label: 'Segment',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_CONTACTS_ON_SEGMENT_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'segmentId',
  },
  icon: 'IconUsersGroup',
});
