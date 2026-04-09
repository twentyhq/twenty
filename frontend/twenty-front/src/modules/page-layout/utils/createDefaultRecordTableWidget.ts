import {
  type GridPosition,
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultRecordTableWidget = (
  id: string,
  pageLayoutTabId: string,
  title: string,
  gridPosition: GridPosition,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId,
    title,
    type: WidgetType.RECORD_TABLE,
    configuration: {
      configurationType: WidgetConfigurationType.RECORD_TABLE,
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
    objectMetadataId: null,
    isOverridden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
