import { type GridPosition } from 'twenty-shared/types';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export const createDefaultFrontComponentWidget = (
  id: string,
  pageLayoutTabId: string,
  title: string,
  frontComponentId: string,
  gridPosition: GridPosition,
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
      row: gridPosition.row,
      column: gridPosition.column,
      rowSpan: gridPosition.rowSpan,
      columnSpan: gridPosition.columnSpan,
    },
    objectMetadataId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
