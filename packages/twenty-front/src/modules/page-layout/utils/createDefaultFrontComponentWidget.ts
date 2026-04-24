import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetGridPosition,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export const createDefaultFrontComponentWidget = (
  id: string,
  pageLayoutTabId: string,
  title: string,
  frontComponentId: string,
  position: Omit<PageLayoutWidgetGridPosition, '__typename' | 'layoutMode'>,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    pageLayoutTabId,
    title,
    isActive: true,
    type: WidgetType.FRONT_COMPONENT,
    configuration: {
      __typename: 'FrontComponentConfiguration',
      configurationType: WidgetConfigurationType.FRONT_COMPONENT,
      frontComponentId,
    },
    position: {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: position.row,
      column: position.column,
      rowSpan: position.rowSpan,
      columnSpan: position.columnSpan,
    },
    objectMetadataId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
