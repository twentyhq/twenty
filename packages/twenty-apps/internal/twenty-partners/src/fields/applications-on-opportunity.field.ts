import {
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import {
  APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
} from 'src/objects/application.object';

export default defineField({
  universalIdentifier: APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'applications',
  label: 'Applications',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPLICATION_OPPORTUNITY_FIELD_ID,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
