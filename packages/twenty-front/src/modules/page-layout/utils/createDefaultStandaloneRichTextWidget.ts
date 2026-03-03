import {
  type GridPosition,
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  type RichTextV2Body,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultStandaloneRichTextWidget = (
  id: string,
  pageLayoutTabId: string,
  body: RichTextV2Body,
  gridPosition: GridPosition,
  objectMetadataId?: string | null,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId,
    title: 'Untitled Rich Text',
    type: WidgetType.STANDALONE_RICH_TEXT,
    configuration: {
      configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
      body,
    },
    gridPosition,
    position: {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: gridPosition.row,
      column: gridPosition.column,
      rowSpan: gridPosition.rowSpan,
      columnSpan: gridPosition.columnSpan,
    },
    objectMetadataId: objectMetadataId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
