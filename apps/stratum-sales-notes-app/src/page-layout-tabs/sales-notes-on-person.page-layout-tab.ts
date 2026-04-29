import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

import {
  DEFAULT_PERSON_LAYOUT_UID,
  SALES_NOTES_LIST_ON_PERSON_FRONT_COMPONENT_UID,
  SALES_NOTES_ON_PERSON_TAB_UID,
  SALES_NOTES_ON_PERSON_WIDGET_UID,
} from 'src/constants/universal-identifiers';

// Adds a "Sales notes" tab to the default Person layout. Position 200 puts
// it before the standard "Notes" tab (which sits later in the default
// layout). The widget is a FRONT_COMPONENT that fetches the salesNotes the
// focal Person is an attendee on (via the salesNoteAttendee junction) and
// renders them as a clickable list.
export default definePageLayoutTab({
  universalIdentifier: SALES_NOTES_ON_PERSON_TAB_UID,
  pageLayoutUniversalIdentifier: DEFAULT_PERSON_LAYOUT_UID,
  title: 'Sales notes',
  position: 200,
  icon: 'IconNotebook',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  widgets: [
    {
      universalIdentifier: SALES_NOTES_ON_PERSON_WIDGET_UID,
      title: 'Sales notes',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          SALES_NOTES_LIST_ON_PERSON_FRONT_COMPONENT_UID,
      },
    },
  ],
});
