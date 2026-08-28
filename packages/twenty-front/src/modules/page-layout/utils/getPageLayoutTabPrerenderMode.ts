import { APPLICATION_PRERENDERABLE_WIDGET_TYPES } from '@/page-layout/constants/ApplicationPrerenderableWidgetTypes';
import { SUSPENSE_PRERENDERABLE_WIDGET_TYPES } from '@/page-layout/constants/SuspensePrerenderableWidgetTypes';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutTabPrerenderMode } from '@/page-layout/types/PageLayoutTabPrerenderMode';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

export const getPageLayoutTabPrerenderMode = ({
  tab,
  pageLayoutType,
}: {
  tab: PageLayoutTab;
  pageLayoutType: PageLayoutType;
}): PageLayoutTabPrerenderMode => {
  if (pageLayoutType !== PageLayoutType.RECORD_PAGE) {
    return 'not-prerenderable';
  }

  // Grid tabs size their widgets from the container, which measures zero
  // while hidden; vertical lists lay out correctly on reveal.
  if (tab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST) {
    return 'not-prerenderable';
  }

  const isSuspenseOnly = tab.widgets.every((widget) =>
    SUSPENSE_PRERENDERABLE_WIDGET_TYPES.includes(widget.type),
  );

  if (isSuspenseOnly) {
    return 'hidden-activity';
  }

  const isPrerenderable = tab.widgets.every(
    (widget) =>
      SUSPENSE_PRERENDERABLE_WIDGET_TYPES.includes(widget.type) ||
      APPLICATION_PRERENDERABLE_WIDGET_TYPES.includes(widget.type),
  );

  // A tab mixing data cards with application widgets mounts offscreen as a
  // whole: application content needs its effects while hidden, and the data
  // cards tolerate that (it is the pre-Activity behavior).
  if (isPrerenderable) {
    return 'offscreen-mounted';
  }

  return 'not-prerenderable';
};
