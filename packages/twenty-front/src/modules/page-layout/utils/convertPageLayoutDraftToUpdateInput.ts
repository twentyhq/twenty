import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
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
      const gridPosition =
        widget.position?.__typename === 'PageLayoutWidgetGridPosition'
          ? widget.position
          : undefined;

      return {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: gridPosition?.row ?? 0,
        column: gridPosition?.column ?? 0,
        rowSpan: gridPosition?.rowSpan ?? 1,
        columnSpan: gridPosition?.columnSpan ?? 1,
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
