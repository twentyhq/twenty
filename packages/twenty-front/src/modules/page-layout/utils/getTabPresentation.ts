import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type GetTabPresentationParams = {
  widgets: PageLayoutWidget[];
  layoutMode: PageLayoutTabLayoutMode;
  isInEditMode?: boolean;
};

// Edit mode always stacks so every tab is edited through the same vertical-list editor.
export const getTabPresentation = ({
  widgets,
  layoutMode,
  isInEditMode = false,
}: GetTabPresentationParams): TabPresentation => {
  if (isInEditMode || layoutMode === PageLayoutTabLayoutMode.GRID) {
    return 'stack';
  }

  return widgets.length === 1 ? 'solo' : 'stack';
};
