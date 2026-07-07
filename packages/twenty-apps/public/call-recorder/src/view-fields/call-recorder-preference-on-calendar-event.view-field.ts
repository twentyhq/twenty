import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-preference-on-calendar-event-field-universal-identifier';
import { CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_VIEW_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-preference-on-calendar-event-view-field-universal-identifier';

const CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.views
    .calendarEventRecordPageFields;

export default defineViewField({
  universalIdentifier:
    CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier:
    CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW.universalIdentifier,
  viewFieldGroupUniversalIdentifier:
    CALENDAR_EVENT_RECORD_PAGE_FIELDS_VIEW.viewFieldGroups.general
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 8,
  isVisible: true,
  size: 150,
});
