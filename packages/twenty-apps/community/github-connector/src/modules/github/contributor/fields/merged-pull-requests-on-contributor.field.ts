import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { MERGER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/fields/merger-on-pull-request.field';

export const MERGED_PULL_REQUESTS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER =
  '02ec0165-fb5a-46f9-b7c7-a0fd605befa2';

export default defineField({
  universalIdentifier:
    MERGED_PULL_REQUESTS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'mergedPullRequests',
  label: 'Merged Pull Requests',
  icon: 'IconGitMerge',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    MERGER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
