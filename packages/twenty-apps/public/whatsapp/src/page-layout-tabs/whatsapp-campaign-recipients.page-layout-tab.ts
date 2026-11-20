import {
  definePageLayoutTab,
  getSystemRecordPageLayoutUniversalIdentifier,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGN_RECIPIENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGN_RECIPIENTS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGN_RECIPIENTS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayoutTab({
  universalIdentifier: WHATSAPP_CAMPAIGN_RECIPIENTS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: WHATSAPP_CAMPAIGN_UNIVERSAL_IDENTIFIER,
  }),
  title: 'Recipients',
  icon: 'IconUsers',
  position: 1,
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  widgets: [
    {
      universalIdentifier: WHATSAPP_CAMPAIGN_RECIPIENTS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Recipients',
      type: 'FRONT_COMPONENT',
      position: { layoutMode: PageLayoutTabLayoutMode.CANVAS },
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier: WHATSAPP_CAMPAIGN_RECIPIENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
