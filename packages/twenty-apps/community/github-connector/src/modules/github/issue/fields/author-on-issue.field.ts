import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { ISSUE_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/objects/issue.object';
import { ENGINEER_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/objects/engineer.object';
import { AUTHORED_ISSUES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/fields/authored-issues-on-engineer.field';

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
    ENGINEER_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    AUTHORED_ISSUES_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'authorId',
  },
});
