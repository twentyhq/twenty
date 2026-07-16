import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER } from '../objects/executive-award.object';
import { EXECUTIVE_AWARD_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-award.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_AWARD_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveAwards',
  label: 'Awards',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '7f04947f-4e74-464a-a3e1-d37a38167616', // EXECUTIVE_AWARD_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
