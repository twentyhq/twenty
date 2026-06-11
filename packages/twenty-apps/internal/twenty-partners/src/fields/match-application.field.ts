import { FieldType, OnDeleteAction, RelationType, defineField } from 'twenty-sdk/define';

import { APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/application.object';
import { MATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/match.object';

export const MATCH_APPLICATION_FIELD_ID = 'c0a8b1a4-0000-4000-8000-000000000001';
export const MATCHES_ON_APPLICATION_FIELD_ID = 'c0a8b1a4-0000-4000-8000-000000000002';

export default defineField({
  universalIdentifier: MATCH_APPLICATION_FIELD_ID,
  objectUniversalIdentifier: MATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'application',
  label: 'Application',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MATCHES_ON_APPLICATION_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'applicationId',
  },
});
