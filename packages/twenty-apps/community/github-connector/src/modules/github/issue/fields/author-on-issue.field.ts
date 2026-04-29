import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { ISSUE_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/objects/issue.object';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { AUTHORED_ISSUES_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/fields/authored-issues-on-contributor.field';

export const ISSUE_AUTHOR_FIELD_UNIVERSAL_IDENTIFIER =
  '5ff7ab7f-bcfa-4e7a-9a33-0860ec692736';

export default defineField({
  universalIdentifier: ISSUE_AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'author',
  label: 'Author',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    AUTHORED_ISSUES_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'authorId',
  },
});
