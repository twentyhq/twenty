import {
  type GridPosition,
  type PageLayoutWidget,
  WidgetType,
} from '~/generated/graphql';

export const createDefaultIframeWidget = (
  id: string,
  pageLayoutTabId: string,
  title: string,
  url: string,
  gridPosition: GridPosition,
  objectMetadataId?: string | null,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId,
    title,
    type: WidgetType.IFRAME,
    configuration: {
      url,
    },
    gridPosition,
    objectMetadataId: objectMetadataId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
