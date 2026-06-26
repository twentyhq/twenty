import {
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import {
  APPLICATIONS_AS_PARTNER_USER_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_PARTNER_USER_FIELD_ID,
} from 'src/objects/application.object';

export default defineField({
  universalIdentifier: APPLICATIONS_AS_PARTNER_USER_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partnerApplications',
  label: 'Partner Applications',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPLICATION_PARTNER_USER_FIELD_ID,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
