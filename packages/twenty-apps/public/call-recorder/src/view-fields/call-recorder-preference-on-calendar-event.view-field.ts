import { defineViewField } from 'twenty-sdk/define';

import { CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-preference-on-calendar-event-field-universal-identifier';
import { CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_VIEW_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-preference-on-calendar-event-view-field-universal-identifier';

// TODO: hardcoded because the published twenty-sdk (2.14.0) predates the
// calendarEventRecordPageFields view. Replace both with
// STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.views.calendarEventRecordPageFields
// once the SDK is republished with this view.
const CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER =
  'c73668d1-022d-4eaf-b825-4e2548180db6';
const CALENDAR_EVENT_RECORD_PAGE_FIELDS_GENERAL_GROUP_UNIVERSAL_IDENTIFIER =
  'aeadeb9e-3673-4c0c-8845-f59cb1e6ca42';

export default defineViewField({
  universalIdentifier:
    CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier:
    CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier:
    CALENDAR_EVENT_RECORD_PAGE_FIELDS_GENERAL_GROUP_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier:
    CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 8,
  isVisible: true,
  size: 150,
});
