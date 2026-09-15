import { DEFAULT_WIDGET_SIZE } from 'twenty-shared/constants';

import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetGridPosition } from '@/page-layout/utils/getWidgetGridPosition';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  type UpdatePageLayoutWithTabsInput,
} from '~/generated-metadata/graphql';

const buildWidgetPosition = (
  widget: PageLayoutWidget,
  widgetIndex: number,
  tabLayoutMode: PageLayoutTabLayoutMode,
) => {
  switch (tabLayoutMode) {
    case PageLayoutTabLayoutMode.VERTICAL_LIST: {
      const index =
        widget.position?.__typename === 'PageLayoutWidgetVerticalListPosition'
          ? widget.position.index
          : widgetIndex;
      const heightBehavior =
        widget.position?.__typename === 'PageLayoutWidgetVerticalListPosition'
          ? widget.position.heightBehavior
          : undefined;

      return {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index,
        ...(isDefined(heightBehavior) ? { heightBehavior } : {}),
      };
    }
    case PageLayoutTabLayoutMode.CANVAS:
      return {
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      };
    case PageLayoutTabLayoutMode.GRID: {
      const position = getWidgetGridPosition(widget);

      return {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: position?.row ?? 0,
        column: position?.column ?? 0,
        rowSpan: position?.rowSpan ?? DEFAULT_WIDGET_SIZE.default.h,
        columnSpan: position?.columnSpan ?? DEFAULT_WIDGET_SIZE.default.w,
      };
    }
  }
};

export const convertPageLayoutDraftToUpdateInput = (
  pageLayoutDraft: DraftPageLayout,
): UpdatePageLayoutWithTabsInput => {
  return {
    name: pageLayoutDraft.name,
    type: pageLayoutDraft.type,
    objectMetadataId: pageLayoutDraft.objectMetadataId ?? null,
    isFirstTabPinned: pageLayoutDraft.isFirstTabPinned,
    tabs: pageLayoutDraft.tabs
      .filter((tab) => tab.isActive)
      .map((tab) => {
        return {
          id: tab.id,
          title: tab.title,
          position: tab.position,
          icon: tab.icon ?? null,
          layoutMode: tab.layoutMode,
          widgets: tab.widgets.map((widget, widgetIndex) => ({
            id: widget.id,
            pageLayoutTabId: widget.pageLayoutTabId,
            title: widget.title,
            type: widget.type,
            objectMetadataId: widget.objectMetadataId ?? null,
            position: buildWidgetPosition(
              widget,
              widgetIndex,
              tab.layoutMode ?? PageLayoutTabLayoutMode.GRID,
            ),
            configuration: widget.configuration ?? null,
            conditionalAvailabilityExpression:
              widget.conditionalAvailabilityExpression ?? null,
          })),
        };
      }),
  };
};
