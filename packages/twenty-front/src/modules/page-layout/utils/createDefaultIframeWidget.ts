import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  type PageLayoutWidgetGridPosition,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultIframeWidget = (
  id: string,
  pageLayoutTabId: string,
  title: string,
  url: string | null,
  position: Omit<PageLayoutWidgetGridPosition, '__typename' | 'layoutMode'>,
  objectMetadataId?: string | null,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    pageLayoutTabId,
    title,
    isActive: true,
    type: WidgetType.IFRAME,
    configuration: {
      configurationType: WidgetConfigurationType.IFRAME,
      url,
    },
    position: {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: position.row,
      column: position.column,
      rowSpan: position.rowSpan,
      columnSpan: position.columnSpan,
    },
    objectMetadataId: objectMetadataId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
