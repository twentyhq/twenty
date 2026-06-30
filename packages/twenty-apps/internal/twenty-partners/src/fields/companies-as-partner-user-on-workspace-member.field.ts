import { FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { COMPANIES_AS_PARTNER_USER_FIELD_ID, PARTNER_USER_ON_COMPANY_FIELD_ID } from './partner-user-on-company.field';

export default defineField({
  universalIdentifier: COMPANIES_AS_PARTNER_USER_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'companiesAsPartnerUser',
  label: 'Companies (as partner user)',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_USER_ON_COMPANY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
