import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { TESTER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/fields/tester-on-pull-request.field';

export const TESTING_PRS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER =
  'e5f6a7b8-4d5e-4f6a-b1c2-9d0e1f2a3b4c';

export default defineField({
  universalIdentifier: TESTING_PRS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'testingPrs',
  label: 'Testing PRs',
  icon: 'IconChecklist',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    TESTER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
