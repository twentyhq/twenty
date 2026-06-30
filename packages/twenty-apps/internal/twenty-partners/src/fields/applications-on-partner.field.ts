import { FieldType, RelationType, defineField } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  APPLICATIONS_ON_PARTNER_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_PARTNER_FIELD_ID,
} from 'src/objects/application.object';

export default defineField({
  universalIdentifier: APPLICATIONS_ON_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'applications',
  label: 'Applications',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
