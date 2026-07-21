import { ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_CONTENT_PARTNER_FIELD_ID } from 'src/fields/partner-content-partner.field';
import {
  PARTNER_CONTENT_BODY_FIELD_ID,
  PARTNER_CONTENT_CASE_STUDY_LINK_FIELD_ID,
  PARTNER_CONTENT_CLIENT_NAME_FIELD_ID,
  PARTNER_CONTENT_COVER_IMAGE_FIELD_ID,
  PARTNER_CONTENT_HEADLINE_FIELD_ID,
  PARTNER_CONTENT_NAME_FIELD_ID,
  PARTNER_CONTENT_STATUS_FIELD_ID,
} from 'src/objects/partner-content.object';

export const PARTNER_CONTENT_RECORD_PAGE_FIELDS_VIEW_ID =
  'a1b2c3d4-5e6f-4789-a012-3456789abcde';

// FIELDS_WIDGET view backing the Partner Content record page side panel.
export default defineView({
  universalIdentifier: PARTNER_CONTENT_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Partner Content Record Page Fields',
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    {
      universalIdentifier: 'b1f5cf01-b00b-4bd8-9eea-d9367de99ddc',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: 'bb8fe4da-2a4e-4186-85e9-479ec9f6f456',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_CLIENT_NAME_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'a77fb95d-34ad-4774-8a3c-4315aee80496',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_HEADLINE_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '0181ea5a-c230-4d34-92f2-f7ce336e1da3',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_BODY_FIELD_ID,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: 'd621d2ab-6aef-48af-9642-ab044a54da23',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_COVER_IMAGE_FIELD_ID,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: '3eca37d5-5222-4efe-bacb-2e475b672749',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_CASE_STUDY_LINK_FIELD_ID,
      position: 5,
      isVisible: true,
    },
    {
      universalIdentifier: 'c0b717ae-3ffd-4753-bd76-e747afae1fcd',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_STATUS_FIELD_ID,
      position: 6,
      isVisible: true,
    },
    {
      universalIdentifier: '18f3aae8-0e1b-4b2d-962d-a45f76a4ce7f',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_PARTNER_FIELD_ID,
      position: 7,
      isVisible: true,
    },
  ],
});
