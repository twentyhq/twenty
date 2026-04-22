import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { ENGINEER_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/objects/engineer.object';
import { TESTING_PRS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/fields/testing-prs-on-engineer.field';

export const TESTER_FIELD_UNIVERSAL_IDENTIFIER =
  'd4e5f6a7-3c4d-4e5f-a0b1-8c9d0e1f2a3b';

export default defineField({
  universalIdentifier: TESTER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'tester',
  label: 'Tester',
  icon: 'IconUserCheck',
  relationTargetObjectMetadataUniversalIdentifier: ENGINEER_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    TESTING_PRS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'testerId',
  },
});
