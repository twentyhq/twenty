import { FieldType, RelationType, defineField } from 'twenty-sdk/define';

import {
  APPLICATION_BRIEF_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATIONS_ON_BRIEF_FIELD_ID,
} from 'src/objects/application.object';
import { BRIEF_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/brief.object';

export default defineField({
  universalIdentifier: APPLICATIONS_ON_BRIEF_FIELD_ID,
  objectUniversalIdentifier: BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'applications',
  label: 'Applications',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: APPLICATION_BRIEF_FIELD_ID,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
