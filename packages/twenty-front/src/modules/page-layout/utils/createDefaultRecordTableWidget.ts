import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidget,
  type PageLayoutWidgetGridPosition,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultRecordTableWidget = ({
  id,
  pageLayoutTabId,
  title,
  position,
  objectMetadataId,
}: {
  id: string;
  pageLayoutTabId: string;
  title: string;
  position: Omit<PageLayoutWidgetGridPosition, '__typename' | 'layoutMode'>;
  objectMetadataId?: string;
}): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    pageLayoutTabId,
    title,
    isActive: true,
    type: WidgetType.RECORD_TABLE,
    configuration: {
      configurationType: WidgetConfigurationType.RECORD_TABLE,
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
    isOverridden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
