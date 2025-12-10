import {
  type GridPosition,
  type PageLayoutWidget,
  type RichTextV2Body,
  WidgetType,
} from '~/generated/graphql';

export const createDefaultStandaloneRichTextWidget = (
  id: string,
  pageLayoutTabId: string,
  body: RichTextV2Body,
  gridPosition: GridPosition,
  objectMetadataId?: string | null,
): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId,
    title: 'Untitled Rich Text',
    type: WidgetType.STANDALONE_RICH_TEXT,
    configuration: {
      body,
    },
    gridPosition,
    objectMetadataId: objectMetadataId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
