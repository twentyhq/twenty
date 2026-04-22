import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { EXTERNAL_CONTRIBUTIONS_DASHBOARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/front-components/external-contributions-dashboard.front-component';

export const EXTERNAL_CONTRIBUTIONS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  'd7c2f9a4-3b81-4e56-9c08-1a5d8e2f6b94';

export default definePageLayout({
  universalIdentifier: EXTERNAL_CONTRIBUTIONS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'External Contributions',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: 'e1b3a8c5-7d24-4f9e-9c81-2a4f6d8b1e5c',
      title: 'External Contributions',
      position: 0,
      icon: 'IconWorld',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: 'f2c4b9d6-8e35-4a0f-ad92-3b5e7c9d2f6a',
          title: 'External Contributions',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              EXTERNAL_CONTRIBUTIONS_DASHBOARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
