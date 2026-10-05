import { v4 as uuidv4 } from 'uuid';

export const getPageLayoutWidgetBaseFile = ({ name }: { name: string }) => {
  return `import {
  definePageLayoutWidget,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default definePageLayoutWidget({
  universalIdentifier: '${uuidv4()}',
  pageLayoutTabUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.tabs.home
      .universalIdentifier,
  title: '${name}',
  type: 'IFRAME',
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 1000 },
  configuration: { configurationType: 'IFRAME', url: 'https://example.com' },
});
`;
};
