import { FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { OPPORTUNITIES_AS_PARTNER_USER_FIELD_ID, PARTNER_USER_ON_OPPORTUNITY_FIELD_ID } from './partner-user-on-opportunity.field';

export default defineField({
  universalIdentifier: OPPORTUNITIES_AS_PARTNER_USER_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'opportunitiesAsPartnerUser',
  label: 'Opportunities (as partner user)',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_USER_ON_OPPORTUNITY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
