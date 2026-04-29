import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

import {
  DEFAULT_COMPANY_LAYOUT_UID,
  SALES_NOTES_LIST_ON_COMPANY_FRONT_COMPONENT_UID,
  SALES_NOTES_ON_COMPANY_TAB_UID,
  SALES_NOTES_ON_COMPANY_WIDGET_UID,
} from 'src/constants/universal-identifiers';

// Adds a "Sales notes" tab to the default Company layout. Widget renders a
// list of salesNotes whose `companyId` matches the focal record.
export default definePageLayoutTab({
  universalIdentifier: SALES_NOTES_ON_COMPANY_TAB_UID,
  pageLayoutUniversalIdentifier: DEFAULT_COMPANY_LAYOUT_UID,
  title: 'Sales notes',
  position: 200,
  icon: 'IconNotebook',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  widgets: [
    {
      universalIdentifier: SALES_NOTES_ON_COMPANY_WIDGET_UID,
      title: 'Sales notes',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          SALES_NOTES_LIST_ON_COMPANY_FRONT_COMPONENT_UID,
      },
    },
  ],
});
