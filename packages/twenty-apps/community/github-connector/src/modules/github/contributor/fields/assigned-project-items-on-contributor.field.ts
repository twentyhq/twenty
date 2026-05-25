import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { PROJECT_ITEM_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/objects/project-item.object';
import { MAIN_ASSIGNEE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/fields/main-assignee-on-project-item.field';

export const ASSIGNED_PROJECT_ITEMS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER =
  'b35aed82-2c01-4f37-b3f9-cf67dc269d2c';

export default defineField({
  universalIdentifier:
    ASSIGNED_PROJECT_ITEMS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'assignedProjectItems',
  label: 'Assigned Items',
  icon: 'IconLayoutKanban',
  relationTargetObjectMetadataUniversalIdentifier:
    PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    MAIN_ASSIGNEE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
