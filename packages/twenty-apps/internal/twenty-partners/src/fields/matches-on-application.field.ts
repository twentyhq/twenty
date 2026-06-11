import { FieldType, RelationType, defineField } from 'twenty-sdk/define';

import { APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/application.object';
import { MATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/match.object';
import { MATCH_APPLICATION_FIELD_ID, MATCHES_ON_APPLICATION_FIELD_ID } from './match-application.field';

export default defineField({
  universalIdentifier: MATCHES_ON_APPLICATION_FIELD_ID,
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'matches',
  label: 'Matches',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: MATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MATCH_APPLICATION_FIELD_ID,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
