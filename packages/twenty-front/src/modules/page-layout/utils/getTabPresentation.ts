import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type TabPresentation } from '@/page-layout/types/TabPresentation';
import { getWidgetDisplayProfile } from '@/page-layout/widgets/utils/getWidgetDisplayProfile';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type GetTabPresentationParams = {
  widgets: PageLayoutWidget[];
  layoutMode: PageLayoutTabLayoutMode;
};

// Presentation is derived from content, never stored. A list-mode tab is "solo"
// when it hosts a single module widget (Timeline, Tasks, a record table...) so
// it can render full-bleed with page-level scroll; otherwise it is a "stack" of
// boxed widgets. Grid tabs (dashboards) are always stacks.
export const getTabPresentation = ({
  widgets,
  layoutMode,
}: GetTabPresentationParams): TabPresentation => {
  if (layoutMode === PageLayoutTabLayoutMode.GRID) {
    return 'stack';
  }

  const soleWidget = widgets.length === 1 ? widgets.at(0) : undefined;

  if (
    isDefined(soleWidget) &&
    getWidgetDisplayProfile(soleWidget.type).affinity === 'module'
  ) {
    return 'solo';
  }

  return 'stack';
};
