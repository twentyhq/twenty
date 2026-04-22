import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { ISSUE_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/objects/issue.object';
import { PROJECT_ITEM_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/objects/project-item.object';
import { LINKED_ISSUE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/fields/linked-issue-on-project-item.field';

export const PROJECT_ITEMS_ON_ISSUE_FIELD_UNIVERSAL_IDENTIFIER =
  '8b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

export default defineField({
  universalIdentifier: PROJECT_ITEMS_ON_ISSUE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'projectItems',
  label: 'Project Items',
  icon: 'IconLayoutKanban',
  relationTargetObjectMetadataUniversalIdentifier:
    PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    LINKED_ISSUE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
