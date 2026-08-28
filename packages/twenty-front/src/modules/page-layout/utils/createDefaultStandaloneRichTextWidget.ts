import {
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
  position: PageLayoutWidgetGridPosition,
  objectMetadataId?: string | null,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    universalIdentifier: id,
    isSystemSideEffect: false,
    pageLayoutTabId,
    title: 'Untitled Rich Text',
    isActive: true,
    type: WidgetType.STANDALONE_RICH_TEXT,
    configuration: {
      configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
      body,
    },
    position: {
      ...position,
      __typename: 'PageLayoutWidgetGridPosition',
    },
    objectMetadataId: objectMetadataId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
