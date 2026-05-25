import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { MERGED_PULL_REQUESTS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/fields/merged-pull-requests-on-contributor.field';

export const MERGER_FIELD_UNIVERSAL_IDENTIFIER =
  '3a4a6af0-a6a7-4cb6-a91d-273a2842449e';

export default defineField({
  universalIdentifier: MERGER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'merger',
  label: 'Merger',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    MERGED_PULL_REQUESTS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'mergerId',
  },
});
