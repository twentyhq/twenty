import { PRERENDERABLE_PAGE_LAYOUT_WIDGET_TYPES } from '@/page-layout/constants/PrerenderablePageLayoutWidgetTypes';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

export const shouldPrerenderPageLayoutTab = ({
  tab,
  pageLayoutType,
}: {
  tab: PageLayoutTab;
  pageLayoutType: PageLayoutType;
}): boolean => {
  if (pageLayoutType !== PageLayoutType.RECORD_PAGE) {
    return false;
  }

  // Grid tabs size their widgets from the container, which measures zero
  // while hidden; vertical lists lay out correctly on reveal.
  if (tab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST) {
    return false;
  }

  return tab.widgets.every((widget) =>
    PRERENDERABLE_PAGE_LAYOUT_WIDGET_TYPES.includes(widget.type),
  );
};
