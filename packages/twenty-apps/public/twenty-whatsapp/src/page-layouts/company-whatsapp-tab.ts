import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default definePageLayoutTab({
  universalIdentifier: WHATSAPP_UNIVERSAL_IDENTIFIERS.companyWhatsappTab,
  title: 'WhatsApp',
  position: 20,
  icon: 'IconBrandWhatsapp',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage
      .universalIdentifier,
  widgets: [
    {
      universalIdentifier:
        WHATSAPP_UNIVERSAL_IDENTIFIERS.companyWhatsappWidget,
      title: 'WhatsApp messages',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          WHATSAPP_UNIVERSAL_IDENTIFIERS.whatsappMessagesFrontComponent,
      },
    },
  ],
});
