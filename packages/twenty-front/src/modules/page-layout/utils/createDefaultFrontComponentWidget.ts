import {
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
  position: PageLayoutWidgetGridPosition,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    universalIdentifier: id,
    isSystemSideEffect: false,
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
      ...position,
      __typename: 'PageLayoutWidgetGridPosition',
    },
    objectMetadataId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
