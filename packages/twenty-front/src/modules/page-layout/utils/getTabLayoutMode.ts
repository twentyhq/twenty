import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { assertPageLayoutTabHasDefinedLayoutModeOrThrow } from '@/page-layout/utils/assertPageLayoutTabHasDefinedLayoutModeOrThrow';
import { PageLayoutType } from '~/generated/graphql';

type GetTabLayoutModeParams = {
  tab: PageLayoutTab | undefined;
  pageLayoutType: PageLayoutType;
};

export const getTabLayoutMode = ({
  tab,
  pageLayoutType,
}: GetTabLayoutModeParams): PageLayoutTabLayoutMode => {
  if (pageLayoutType === PageLayoutType.RECORD_PAGE) {
    assertPageLayoutTabHasDefinedLayoutModeOrThrow(tab);

    return tab.layoutMode;
  }

  return 'grid';
};
