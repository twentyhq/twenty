import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';
import {
  POST_CARDS_ON_PERSON_ID,
  RECIPIENT_ON_POST_CARD_ID,
} from './recipient-on-post-card.field';

export default defineField({
  universalIdentifier: POST_CARDS_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'postCards',
  label: 'Post Cards',
  icon: 'IconMail',
  relationTargetObjectMetadataUniversalIdentifier:
    POST_CARD_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: RECIPIENT_ON_POST_CARD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
