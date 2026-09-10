import { PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

export const getPageLayoutBaseFile = ({
  name,
  type,
}: {
  name: string;
  type: PageLayoutType;
}) => {
  const layoutMode =
    type === PageLayoutType.DASHBOARD
      ? PageLayoutTabLayoutMode.GRID
      : PageLayoutTabLayoutMode.VERTICAL_LIST;

  return `import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '${uuidv4()}',
  name: '${name}',
  type: PageLayoutType.${type},
  tabs: [
    {
      universalIdentifier: '${uuidv4()}',
      title: 'Overview',
      position: 0,
      layoutMode: PageLayoutTabLayoutMode.${layoutMode},
      widgets: [],
    },
  ],
});
`;
};
