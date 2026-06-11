import { FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { BRIEF_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/brief.object';
import { BRIEF_OPPORTUNITY_FIELD_ID, BRIEFS_ON_OPPORTUNITY_FIELD_ID } from './brief-opportunity.field';

export default defineField({
  universalIdentifier: BRIEFS_ON_OPPORTUNITY_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'briefs',
  label: 'Briefs',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: BRIEF_OPPORTUNITY_FIELD_ID,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
