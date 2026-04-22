import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { PROJECT_ITEM_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/objects/project-item.object';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { ASSIGNED_PROJECT_ITEMS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/fields/assigned-project-items-on-contributor.field';

export const MAIN_ASSIGNEE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER =
  '5bc9d7b3-ca5a-4006-bd74-0420d1f3df85';

export default defineField({
  universalIdentifier: MAIN_ASSIGNEE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'mainAssignee',
  label: 'Main Assignee',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    ASSIGNED_PROJECT_ITEMS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'mainAssigneeId',
  },
});
