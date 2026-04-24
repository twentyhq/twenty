import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  type PageLayoutWidgetGridPosition,
  type RichTextBody,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultStandaloneRichTextWidget = (
  id: string,
  pageLayoutTabId: string,
  body: RichTextBody,
  position: Omit<PageLayoutWidgetGridPosition, '__typename' | 'layoutMode'>,
  objectMetadataId?: string | null,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    pageLayoutTabId,
    title: 'Untitled Rich Text',
    isActive: true,
    type: WidgetType.STANDALONE_RICH_TEXT,
    configuration: {
      configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
      body,
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
