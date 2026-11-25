import {
  definePageLayoutTab,
  getSystemRecordPageLayoutUniversalIdentifier,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
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
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: WHATSAPP_CAMPAIGN_RECIPIENTS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Recipients',
      type: 'FRONT_COMPONENT',
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier: WHATSAPP_CAMPAIGN_RECIPIENTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
