import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { AUTHORED_PRS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/fields/authored-prs-on-contributor.field';

export const AUTHOR_FIELD_UNIVERSAL_IDENTIFIER =
  'b2c3d4e5-1a2b-4c3d-8e5f-6a7b8c9d0e1f';

export default defineField({
  universalIdentifier: AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'author',
  label: 'Author',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    AUTHORED_PRS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'authorId',
  },
});
