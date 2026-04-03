import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export const RECIPIENT_ON_POST_CARD_ID = 'c44f158e-2747-42c6-9295-75b8cbae7039';
export const POST_CARDS_ON_PERSON_ID = 'd4aa40b9-077b-46f3-a685-5f0f08ad318c';

export default defineField({
  universalIdentifier: RECIPIENT_ON_POST_CARD_ID,
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'recipient',
  label: 'Recipient',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: POST_CARDS_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'recipientId',
  },
});
