import { v4 as uuidv4 } from 'uuid';

export const getPageLayoutTabBaseFile = ({ name }: { name: string }) => {
  return `import { definePageLayoutTab, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

export default definePageLayoutTab({
  universalIdentifier: '${uuidv4()}',
  pageLayoutUniversalIdentifier: 'replace-with-existing-page-layout-uuid',
  title: '${name}',
  position: 1000,
  icon: 'IconLayout',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  widgets: [],
});
`;
};
