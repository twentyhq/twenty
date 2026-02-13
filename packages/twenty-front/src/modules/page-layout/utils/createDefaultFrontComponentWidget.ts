import {
  type GridPosition,
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
    pageLayoutTabId,
    title,
    type: WidgetType.FRONT_COMPONENT,
    configuration: {
      __typename: 'FrontComponentConfiguration',
      configurationType: WidgetConfigurationType.FRONT_COMPONENT,
      frontComponentId,
    },
    gridPosition,
    objectMetadataId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
