import {
  SALES_NOTE_ATTENDEE_NAME_FIELD_UID,
  SALES_NOTE_ATTENDEE_OBJECT_UID,
} from 'src/constants/universal-identifiers';
import { defineObject, FieldType } from 'twenty-sdk/define';

// Junction object: salesNote ↔ Person many-to-many.
// One row = "Person P attended salesNote S". Twenty SDK only exposes
// MANY_TO_ONE / ONE_TO_MANY, so we model M2M with this explicit junction
// (same pattern as Stratum's existing personTag / accountTag).
export default defineObject({
  universalIdentifier: SALES_NOTE_ATTENDEE_OBJECT_UID,
  nameSingular: 'salesNoteAttendee',
  namePlural: 'salesNoteAttendees',
  labelSingular: 'Sales note attendee',
  labelPlural: 'Sales note attendees',
  description:
    'Junction linking a sales note to one of its attending People. Multiple rows per sales note for multi-attendee meetings.',
  icon: 'IconUsers',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SALES_NOTE_ATTENDEE_NAME_FIELD_UID,
  fields: [
    {
      universalIdentifier: SALES_NOTE_ATTENDEE_NAME_FIELD_UID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description:
        'Cached display label (typically "<person name> @ <sales note title>"). Populated by the app on insert.',
      icon: 'IconAbc',
    },
  ],
});
