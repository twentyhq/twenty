import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type UpdatePageLayoutWithTabsInput } from '~/generated/graphql';

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
      widgets: tab.widgets.map((widget) => ({
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
        configuration: widget.configuration ?? null,
      })),
    })),
  };
};
