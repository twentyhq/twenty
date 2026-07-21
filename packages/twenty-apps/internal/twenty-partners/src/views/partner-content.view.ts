import { ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_CONTENT_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  PARTNER_CONTENT_BODY_FIELD_ID,
  PARTNER_CONTENT_CASE_STUDY_LINK_FIELD_ID,
  PARTNER_CONTENT_CLIENT_NAME_FIELD_ID,
  PARTNER_CONTENT_COVER_IMAGE_FIELD_ID,
  PARTNER_CONTENT_HEADLINE_FIELD_ID,
  PARTNER_CONTENT_NAME_FIELD_ID,
  PARTNER_CONTENT_STATUS_FIELD_ID,
  PARTNER_CONTENT_TYPE_FIELD_ID,
} from 'src/objects/partner-content.object';

// Index view for partner content.
export default defineView({
  universalIdentifier: PARTNER_CONTENT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partner content',
  icon: 'IconQuote',
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  fields: [
    {
      universalIdentifier: 'ad7b3702-b552-4355-afec-1e1e96d9f3df',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: 'a9bf3eaa-ec27-4a0a-8df2-e18c8f4239a7',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_TYPE_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '9358ce8a-4a1e-478f-b4ef-860d5a2b8e9d',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_CLIENT_NAME_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'f63a8f86-2eb6-4acf-8411-e74f8ab1f944',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_HEADLINE_FIELD_ID,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '5339bd09-3d8e-4fa1-a41d-c70d885f8674',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_BODY_FIELD_ID,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: '678a6d18-c68e-4f74-ab73-20f6cc4ca4f1',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_COVER_IMAGE_FIELD_ID,
      position: 5,
      isVisible: true,
    },
    {
      universalIdentifier: 'c80a987f-cf89-4228-965d-2b11f4aad8df',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_CASE_STUDY_LINK_FIELD_ID,
      position: 6,
      isVisible: true,
    },
    {
      universalIdentifier: '426e0c2d-449d-4a06-860b-0cfe0ed501e6',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_STATUS_FIELD_ID,
      position: 7,
      isVisible: true,
    },
  ],
});
