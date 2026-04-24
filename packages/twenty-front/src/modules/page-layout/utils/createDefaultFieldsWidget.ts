import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultFieldsWidget = ({
  id,
  pageLayoutTabId,
  viewId,
  objectMetadataId,
  positionIndex,
}: {
  id: string;
  pageLayoutTabId: string;
  viewId: string;
  objectMetadataId: string;
  positionIndex: number;
}): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    pageLayoutTabId,
    title: 'Fields',
    isActive: true,
    type: WidgetType.FIELDS,
    configuration: {
      __typename: 'FieldsConfiguration',
      configurationType: WidgetConfigurationType.FIELDS,
      viewId,
    },
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: positionIndex,
    },
    objectMetadataId: objectMetadataId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
