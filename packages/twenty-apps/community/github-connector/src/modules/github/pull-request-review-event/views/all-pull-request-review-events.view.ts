import {
  defineView,
  ViewKey,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  REVIEW_EVENT_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  REVIEW_EVENT_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  REVIEW_EVENT_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PULL_REQUEST_REVIEW_EVENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/pull-request-review-event/objects/pull-request-review-event.object';
import { REVIEWER_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/fields/reviewer-on-review-event.field';
import { PULL_REQUEST_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/fields/pull-request-on-review-event.field';

export const ALL_REVIEW_EVENTS_VIEW_UNIVERSAL_IDENTIFIER =
  'a1b2c3d4-0000-4e5f-a6b7-c8d9e0f1a2b3';

export default defineView({
  universalIdentifier: ALL_REVIEW_EVENTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Review Events',
  objectUniversalIdentifier: PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconEye',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '69e69714-05a5-48cd-98b9-13e79ba602c5',
      fieldMetadataUniversalIdentifier:
        REVIEW_EVENT_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 250,
    },
    {
      universalIdentifier: 'ca794df5-74b0-4fc7-a2a7-05a72380e080',
      fieldMetadataUniversalIdentifier:
        REVIEW_EVENT_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '624b139e-46de-416d-97b2-527c07b3a738',
      fieldMetadataUniversalIdentifier:
        REVIEWER_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'bcf9d3ac-d68c-410b-99f4-7e36f992f767',
      fieldMetadataUniversalIdentifier:
        PULL_REQUEST_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '798ec4a2-9e72-4d48-8010-fe5dcaa7fbed',
      fieldMetadataUniversalIdentifier:
        REVIEW_EVENT_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
  ],
  sorts: [
    {
      universalIdentifier: '0c8f9d6f-1a2d-4b14-a35a-8ec65a0683e3',
      fieldMetadataUniversalIdentifier:
        PULL_REQUEST_REVIEW_EVENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
