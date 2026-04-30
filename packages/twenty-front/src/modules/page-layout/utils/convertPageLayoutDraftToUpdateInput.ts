import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDynamicRelationWidget } from '@/page-layout/utils/isDynamicRelationWidget';
import { isGridPosition } from '@/page-layout/utils/isGridPosition';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
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
        widget.position && isVerticalListPosition(widget.position)
          ? widget.position.index
          : widgetIndex;

      return {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index,
      };
    }
    case PageLayoutTabLayoutMode.CANVAS:
      return {
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      };
    case PageLayoutTabLayoutMode.GRID: {
      if (widget.position && isGridPosition(widget.position)) {
        return {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: widget.position.row,
          column: widget.position.column,
          rowSpan: widget.position.rowSpan,
          columnSpan: widget.position.columnSpan,
        };
      }

      return {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      };
    }
  }
};

export const convertPageLayoutDraftToUpdateInput = (
  pageLayoutDraft: DraftPageLayout,
  options?: { shouldFilterDynamicRelationWidgets?: boolean },
): UpdatePageLayoutWithTabsInput => {
  const shouldFilter = options?.shouldFilterDynamicRelationWidgets ?? false;

  return {
    name: pageLayoutDraft.name,
    type: pageLayoutDraft.type,
    objectMetadataId: pageLayoutDraft.objectMetadataId ?? null,
    tabs: pageLayoutDraft.tabs
      .filter((tab) => tab.isActive)
      .map((tab) => {
        const widgets = shouldFilter
          ? tab.widgets.filter((widget) => !isDynamicRelationWidget(widget))
          : tab.widgets;

        return {
          id: tab.id,
          title: tab.title,
          position: tab.position,
          icon: tab.icon ?? null,
          layoutMode: tab.layoutMode,
          widgets: widgets.map((widget, widgetIndex) => ({
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
