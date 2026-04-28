import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { PROJECT_ITEM_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/objects/project-item.object';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { PROJECT_ITEMS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/fields/project-items-on-pull-request.field';

export const LINKED_PR_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER =
  '9c4d5e6f-7a8b-4c9d-ae0f-1a2b3c4d5e6f';

export default defineField({
  universalIdentifier: LINKED_PR_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'linkedPullRequest',
  label: 'Linked PR',
  icon: 'IconGitPullRequest',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PROJECT_ITEMS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'linkedPullRequestId',
  },
});
