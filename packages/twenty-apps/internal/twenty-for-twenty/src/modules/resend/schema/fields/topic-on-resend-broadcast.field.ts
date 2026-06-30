import {
  RESEND_BROADCASTS_ON_TOPIC_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_OBJECT_UNIVERSAL_IDENTIFIER,
  TOPIC_ON_RESEND_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: TOPIC_ON_RESEND_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'topic',
  label: 'Topic',
  relationTargetObjectMetadataUniversalIdentifier:
    RESEND_TOPIC_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RESEND_BROADCASTS_ON_TOPIC_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'topicId',
  },
  icon: 'IconHash',
});
