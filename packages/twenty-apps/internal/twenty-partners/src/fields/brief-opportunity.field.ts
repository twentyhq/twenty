import { FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { BRIEF_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/brief.object';

export const BRIEF_OPPORTUNITY_FIELD_ID = 'c0a8b1a1-0000-4000-8000-000000000001';
export const BRIEFS_ON_OPPORTUNITY_FIELD_ID = 'c0a8b1a1-0000-4000-8000-000000000002';

export default defineField({
  universalIdentifier: BRIEF_OPPORTUNITY_FIELD_ID,
  objectUniversalIdentifier: BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'opportunity',
  label: 'Opportunity',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: BRIEFS_ON_OPPORTUNITY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'opportunityId',
  },
});
