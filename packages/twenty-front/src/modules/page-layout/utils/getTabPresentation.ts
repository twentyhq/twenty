import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type GetTabPresentationParams = {
  widgets: PageLayoutWidget[];
  layoutMode: PageLayoutTabLayoutMode;
  isInEditMode?: boolean;
};

// Presentation is derived from content, never stored. In view mode, a list tab
// hosting a single widget renders it solo: full-bleed, owning the tab. Any
// other tab is a stack of boxed widgets. Edit mode always shows the stack
// structure so every tab is edited through the same vertical-list editor.
// Grid tabs (dashboards) are always stacks.
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
