import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

import {
  DEFAULT_OPPORTUNITY_LAYOUT_UID,
  SALES_NOTES_LIST_ON_OPPORTUNITY_FRONT_COMPONENT_UID,
  SALES_NOTES_ON_OPPORTUNITY_TAB_UID,
  SALES_NOTES_ON_OPPORTUNITY_WIDGET_UID,
} from 'src/constants/universal-identifiers';

// Adds a "Sales notes" tab to the default Opportunity layout. Widget renders
// a list of salesNotes whose `opportunityId` matches the focal record.
export default definePageLayoutTab({
  universalIdentifier: SALES_NOTES_ON_OPPORTUNITY_TAB_UID,
  pageLayoutUniversalIdentifier: DEFAULT_OPPORTUNITY_LAYOUT_UID,
  title: 'Sales notes',
  position: 200,
  icon: 'IconNotebook',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  widgets: [
    {
      universalIdentifier: SALES_NOTES_ON_OPPORTUNITY_WIDGET_UID,
      title: 'Sales notes',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          SALES_NOTES_LIST_ON_OPPORTUNITY_FRONT_COMPONENT_UID,
      },
    },
  ],
});
