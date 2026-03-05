import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDynamicRelationWidget } from '@/page-layout/utils/isDynamicRelationWidget';
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
    case PageLayoutTabLayoutMode.GRID:
      return {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: widget.gridPosition.row,
        column: widget.gridPosition.column,
        rowSpan: widget.gridPosition.rowSpan,
        columnSpan: widget.gridPosition.columnSpan,
      };
  }
};

export const convertPageLayoutDraftToUpdateInput = (
  pageLayoutDraft: DraftPageLayout,
): UpdatePageLayoutWithTabsInput => {
  return {
    name: pageLayoutDraft.name,
    type: pageLayoutDraft.type,
    objectMetadataId: pageLayoutDraft.objectMetadataId ?? null,
    tabs: pageLayoutDraft.tabs.map((tab) => ({
      id: tab.id,
      title: tab.title,
      position: tab.position,
      widgets: tab.widgets
        .filter((widget) => !isDynamicRelationWidget(widget))
        .map((widget, widgetIndex) => ({
          id: widget.id,
          pageLayoutTabId: widget.pageLayoutTabId,
          title: widget.title,
          type: widget.type,
          objectMetadataId: widget.objectMetadataId ?? null,
          gridPosition: {
            row: widget.gridPosition.row,
            column: widget.gridPosition.column,
            rowSpan: widget.gridPosition.rowSpan,
            columnSpan: widget.gridPosition.columnSpan,
          },
          position: buildWidgetPosition(
            widget,
            widgetIndex,
            tab.layoutMode ?? PageLayoutTabLayoutMode.GRID,
          ),
          configuration: widget.configuration ?? null,
        })),
    })),
  };
};
