import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { PROJECT_ITEM_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/objects/project-item.object';
import { LINKED_PR_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/fields/linked-pr-on-project-item.field';

export const PROJECT_ITEMS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER =
  'ad5e6f7a-8b9c-4d0e-bf1a-2b3c4d5e6f7a';

export default defineField({
  universalIdentifier: PROJECT_ITEMS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'projectItems',
  label: 'Project Items',
  icon: 'IconLayoutKanban',
  relationTargetObjectMetadataUniversalIdentifier:
    PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    LINKED_PR_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
