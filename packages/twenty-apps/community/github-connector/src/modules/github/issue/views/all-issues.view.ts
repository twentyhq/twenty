import {
  defineView,
  ViewKey,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  ISSUE_UNIVERSAL_IDENTIFIER,
  ISSUE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  ISSUE_GITHUB_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  ISSUE_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  ISSUE_LABELS_FIELD_UNIVERSAL_IDENTIFIER,
  ISSUE_REPO_FIELD_UNIVERSAL_IDENTIFIER,
  ISSUE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/issue/objects/issue.object';
import { ISSUE_AUTHOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/fields/author-on-issue.field';

export const ALL_ISSUES_VIEW_UNIVERSAL_IDENTIFIER =
  'b2c3d4e5-1111-4f6a-b7c8-d9e0f1a2b3c4';

export default defineView({
  universalIdentifier: ALL_ISSUES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Issues',
  objectUniversalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconBug',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '5b115bd1-489c-44e5-ac1b-7d508e06f165',
      fieldMetadataUniversalIdentifier:
        ISSUE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 300,
    },
    {
      universalIdentifier: '77ac1882-3a13-43e3-822e-c9f5f7d83a67',
      fieldMetadataUniversalIdentifier:
        ISSUE_GITHUB_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 100,
    },
    {
      universalIdentifier: '4f0d17f2-c3a6-4431-a928-3812273592e2',
      fieldMetadataUniversalIdentifier:
        ISSUE_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 100,
    },
    {
      universalIdentifier: '01673163-ccfa-4370-a1c3-48c33b6c4aa3',
      fieldMetadataUniversalIdentifier:
        ISSUE_LABELS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '6d932c97-8f92-4d93-968f-29ca34b27ac0',
      fieldMetadataUniversalIdentifier:
        ISSUE_REPO_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'dc293fd6-747c-4291-9426-5d7b53234936',
      fieldMetadataUniversalIdentifier:
        ISSUE_AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 150,
    },
  ],
  sorts: [
    {
      universalIdentifier: '8e972333-b919-4c1b-ad7b-4fab8f018253',
      fieldMetadataUniversalIdentifier:
        ISSUE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
