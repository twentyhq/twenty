import {
  type GridPosition,
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultIframeWidget = (
  id: string,
  pageLayoutTabId: string,
  title: string,
  url: string | null,
  gridPosition: GridPosition,
  objectMetadataId?: string | null,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId,
    title,
    isActive: true,
    type: WidgetType.IFRAME,
    configuration: {
      configurationType: WidgetConfigurationType.IFRAME,
      url,
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
