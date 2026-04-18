import {
  RESEND_CONTACTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEGMENT_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: SEGMENT_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'segment',
  label: 'Segment',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_CONTACTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'segmentId',
  },
  icon: 'IconUsersGroup',
});
