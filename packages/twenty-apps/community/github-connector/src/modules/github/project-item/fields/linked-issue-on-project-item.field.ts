import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { PROJECT_ITEM_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/objects/project-item.object';
import { ISSUE_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/objects/issue.object';
import { PROJECT_ITEMS_ON_ISSUE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/fields/project-items-on-issue.field';

export const LINKED_ISSUE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER =
  '7a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

export default defineField({
  universalIdentifier: LINKED_ISSUE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'linkedIssue',
  label: 'Linked Issue',
  icon: 'IconBug',
  relationTargetObjectMetadataUniversalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PROJECT_ITEMS_ON_ISSUE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'linkedIssueId',
  },
});
