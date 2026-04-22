import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { AUTHOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/fields/author-on-pull-request.field';

export const AUTHORED_PRS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER =
  'c3d4e5f6-2b3c-4d4e-9f6a-7b8c9d0e1f2a';

export default defineField({
  universalIdentifier: AUTHORED_PRS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'authoredPrs',
  label: 'Authored PRs',
  icon: 'IconGitPullRequest',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
