import { RESEND_BROADCASTS_ON_SEGMENT_ID } from 'src/modules/resend/fields/resend-broadcasts-on-segment.field';
import { RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-broadcast';
import { RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/objects/resend-segment';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const SEGMENT_ON_RESEND_BROADCAST_ID =
  '8b335824-b19d-486e-b865-5761c795c971';

export default defineField({
  universalIdentifier: SEGMENT_ON_RESEND_BROADCAST_ID,
  objectUniversalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'segment',
  label: 'Segment',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_BROADCASTS_ON_SEGMENT_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'segmentId',
  },
  icon: 'IconUsersGroup',
});
