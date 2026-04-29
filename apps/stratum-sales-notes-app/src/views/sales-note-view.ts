import {
  SALES_NOTE_ATTENDEES_FIELD_UID,
  SALES_NOTE_BODY_FIELD_UID,
  SALES_NOTE_NAME_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_STATUS_FIELD_UID,
  SALES_NOTE_SUMMARY_FIELD_UID,
  SALES_NOTE_TO_COMPANY_FIELD_UID,
  SALES_NOTE_TO_OPPORTUNITY_FIELD_UID,
  SALES_NOTE_TO_OWNER_FIELD_UID,
  SALES_NOTE_VIEW_UID,
  VIEW_FIELD_ATTENDEES_UID,
  VIEW_FIELD_BODY_UID,
  VIEW_FIELD_COMPANY_UID,
  VIEW_FIELD_NAME_UID,
  VIEW_FIELD_OPPORTUNITY_UID,
  VIEW_FIELD_OWNER_UID,
  VIEW_FIELD_STATUS_UID,
  VIEW_FIELD_SUMMARY_UID,
} from 'src/constants/universal-identifiers';
import { defineView } from 'twenty-sdk/define';

// Default index view + side-panel field ordering for salesNote.
// Without this, the workspace has no view registered, so the side panel
// on a record renders empty and the index list is unconfigured.
export default defineView({
  universalIdentifier: SALES_NOTE_VIEW_UID,
  name: 'Sales notes',
  objectUniversalIdentifier: SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconNotebook',
  position: 0,
  fields: [
    {
      universalIdentifier: VIEW_FIELD_NAME_UID,
      fieldMetadataUniversalIdentifier: SALES_NOTE_NAME_FIELD_UID,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: VIEW_FIELD_OWNER_UID,
      fieldMetadataUniversalIdentifier: SALES_NOTE_TO_OWNER_FIELD_UID,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: VIEW_FIELD_STATUS_UID,
      fieldMetadataUniversalIdentifier: SALES_NOTE_STATUS_FIELD_UID,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: VIEW_FIELD_COMPANY_UID,
      fieldMetadataUniversalIdentifier: SALES_NOTE_TO_COMPANY_FIELD_UID,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: VIEW_FIELD_OPPORTUNITY_UID,
      fieldMetadataUniversalIdentifier: SALES_NOTE_TO_OPPORTUNITY_FIELD_UID,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: VIEW_FIELD_ATTENDEES_UID,
      fieldMetadataUniversalIdentifier: SALES_NOTE_ATTENDEES_FIELD_UID,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier: VIEW_FIELD_BODY_UID,
      fieldMetadataUniversalIdentifier: SALES_NOTE_BODY_FIELD_UID,
      isVisible: true,
      size: 12,
      position: 6,
    },
    {
      universalIdentifier: VIEW_FIELD_SUMMARY_UID,
      fieldMetadataUniversalIdentifier: SALES_NOTE_SUMMARY_FIELD_UID,
      isVisible: true,
      size: 12,
      position: 7,
    },
  ],
});
