import {
  defineView,
  ViewKey,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  PROJECT_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PROJECT_ITEM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PROJECT_ITEM_SPRINT_FIELD_UNIVERSAL_IDENTIFIER,
  PROJECT_ITEM_ASSIGNEES_FIELD_UNIVERSAL_IDENTIFIER,
  PROJECT_ITEM_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
  PROJECT_ITEM_GITHUB_URL_FIELD_UNIVERSAL_IDENTIFIER,
  PROJECT_ITEM_REPO_FIELD_UNIVERSAL_IDENTIFIER,
  PROJECT_ITEM_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/project-item/objects/project-item.object';
import { MAIN_ASSIGNEE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/fields/main-assignee-on-project-item.field';
import { LINKED_ISSUE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/fields/linked-issue-on-project-item.field';
import { LINKED_PR_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/project-item/fields/linked-pr-on-project-item.field';

export const ALL_PROJECT_ITEMS_VIEW_UNIVERSAL_IDENTIFIER =
  '9bb6d69e-9411-4195-9042-8df2e4b72a11';

export default defineView({
  universalIdentifier: ALL_PROJECT_ITEMS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Project Items',
  objectUniversalIdentifier: PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconLayoutKanban',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '19064693-70e0-4653-b6f6-572c3adfcc78',
      fieldMetadataUniversalIdentifier:
        PROJECT_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 300,
    },
    {
      universalIdentifier: 'f7a1de3d-3989-4cb9-8e8e-0edd1b4d15e7',
      fieldMetadataUniversalIdentifier:
        PROJECT_ITEM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: 'f4fae1f9-8480-4cfd-b493-9dbac84c6643',
      fieldMetadataUniversalIdentifier:
        PROJECT_ITEM_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: '5969adcf-1e89-4561-a052-0296058623f3',
      fieldMetadataUniversalIdentifier:
        MAIN_ASSIGNEE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '21868cca-dae2-45e7-aa92-e667703e8cfe',
      fieldMetadataUniversalIdentifier:
        PROJECT_ITEM_SPRINT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'bf877bd3-a788-4db5-89cd-db6fb74fe49d',
      fieldMetadataUniversalIdentifier:
        PROJECT_ITEM_ASSIGNEES_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '4c063477-ffe8-4799-bc50-bb9b2483cbab',
      fieldMetadataUniversalIdentifier:
        LINKED_ISSUE_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'acba5c9a-fd97-42b6-b0f5-e8e3fb7d49c5',
      fieldMetadataUniversalIdentifier:
        LINKED_PR_ON_PROJECT_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '931fac89-e99d-46dd-b316-85ff04356811',
      fieldMetadataUniversalIdentifier:
        PROJECT_ITEM_GITHUB_URL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '11c446af-470a-40d4-96e8-9e91879accf4',
      fieldMetadataUniversalIdentifier:
        PROJECT_ITEM_REPO_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 180,
    },
  ],
  sorts: [
    {
      universalIdentifier: 'a7c181f1-2961-45b0-a700-dd9489b3420c',
      fieldMetadataUniversalIdentifier:
        PROJECT_ITEM_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
