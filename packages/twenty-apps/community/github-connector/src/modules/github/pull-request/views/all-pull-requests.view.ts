import {
  defineView,
  ViewKey,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GITHUB_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  PR_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PULL_REQUEST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/pull-request/objects/pull-request.object';
import { AUTHOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/fields/author-on-pull-request.field';
import { MERGER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/fields/merger-on-pull-request.field';

export const ALL_PULL_REQUESTS_VIEW_UNIVERSAL_IDENTIFIER =
  'e6a0bd60-08be-4973-81de-0e15ce8f9bf8';

export default defineView({
  universalIdentifier: ALL_PULL_REQUESTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Pull Requests',
  objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconTank',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'fd4fc905-f099-4553-8043-f677d9fbe0e0',
      fieldMetadataUniversalIdentifier:
        PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 250,
    },
    {
      universalIdentifier: '8848460a-5cb3-455d-91a3-d1916293d5f0',
      fieldMetadataUniversalIdentifier:
        GITHUB_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 100,
    },
    {
      universalIdentifier: 'c05e00b7-a18a-44fb-970e-27b0b6ecdc7f',
      fieldMetadataUniversalIdentifier:
        PR_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'f2834200-06c5-4702-b44d-ac04a292444c',
      fieldMetadataUniversalIdentifier: AUTHOR_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '93d10703-194f-4e38-bdeb-813097f19d50',
      fieldMetadataUniversalIdentifier: MERGER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f90a284f-034a-42e8-9a08-38d22f5da983',
      fieldMetadataUniversalIdentifier: MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 180,
    },
  ],
  sorts: [
    {
      universalIdentifier: '7e7497fd-5bcd-43f8-bece-36e82f9f8f3f',
      fieldMetadataUniversalIdentifier:
        PULL_REQUEST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
