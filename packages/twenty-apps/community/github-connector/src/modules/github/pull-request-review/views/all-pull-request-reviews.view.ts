import {
  defineView,
  ViewKey,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  REVIEW_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  REVIEW_LAST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  REVIEW_EVENT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  PULL_REQUEST_REVIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/pull-request-review/objects/pull-request-review.object';
import { REVIEWER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/fields/reviewer-on-review.field';
import { PULL_REQUEST_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/fields/pull-request-on-review.field';

export const ALL_REVIEWS_VIEW_UNIVERSAL_IDENTIFIER =
  '3559d020-bdf4-424b-9b6a-bc3cbb3d4502';

export default defineView({
  universalIdentifier: ALL_REVIEWS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Reviews',
  objectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconEye',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '63010877-3fd3-43f0-a105-66168a0c9782',
      fieldMetadataUniversalIdentifier:
        REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'c7f3ad93-e4bc-47d6-a3c3-664d9975bb60',
      fieldMetadataUniversalIdentifier:
        REVIEW_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'ab0cd954-95e6-4e29-8a73-2ad614dc6b1f',
      fieldMetadataUniversalIdentifier: REVIEWER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '43440edf-ef04-413a-a39c-3ae70b839166',
      fieldMetadataUniversalIdentifier:
        PULL_REQUEST_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '20ddfe2f-0310-4c01-af85-b7c75d801e26',
      fieldMetadataUniversalIdentifier:
        REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 170,
    },
    {
      universalIdentifier: '4e274558-49e9-465a-98c3-44177c6138c3',
      fieldMetadataUniversalIdentifier:
        REVIEW_LAST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 170,
    },
    {
      universalIdentifier: 'd2964ab2-7e05-4ee0-9219-b88cfef78230',
      fieldMetadataUniversalIdentifier:
        REVIEW_EVENT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 110,
    },
  ],
  sorts: [
    {
      universalIdentifier: 'add26365-5060-411e-b0a7-1ce32155d4f1',
      fieldMetadataUniversalIdentifier:
        PULL_REQUEST_REVIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
