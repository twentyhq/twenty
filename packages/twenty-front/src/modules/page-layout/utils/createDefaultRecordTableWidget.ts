import {
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
  isUIEditable,
}: {
  id: string;
  pageLayoutTabId: string;
  title: string;
  position: PageLayoutWidgetGridPosition;
  objectMetadataId?: string;
  isUIEditable?: boolean;
}): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    universalIdentifier: id,
    isSystemSideEffect: false,
    pageLayoutTabId,
    title,
    isActive: true,
    type: WidgetType.RECORD_TABLE,
    configuration: {
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      isUIEditable,
    },
    position: {
      ...position,
      __typename: 'PageLayoutWidgetGridPosition',
    },
    objectMetadataId: objectMetadataId ?? null,
    isOverridden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
