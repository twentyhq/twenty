import { CALL_RECORDING_ON_PERSON_ID } from 'src/fields/call-recording-on-person.field';
import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export const PEOPLE_ON_CALL_RECORDING_ID =
  '0066e1d2-59f6-4ca7-8073-ca9bd964bfe0';

export default defineField({
  universalIdentifier: PEOPLE_ON_CALL_RECORDING_ID,
  objectUniversalIdentifier: CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    CALL_RECORDING_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
  icon: 'IconUser',
});
