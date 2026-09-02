import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import {
  type PageLayoutWidgetGridPosition,
  type PageLayoutWidgetVerticalListPosition,
  type RichTextBody,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

type CreateDefaultStandaloneRichTextWidgetParams = {
  id: string;
  pageLayoutTabId: string;
  body: RichTextBody;
  position: PageLayoutWidgetGridPosition | PageLayoutWidgetVerticalListPosition;
  objectMetadataId?: string | null;
  title?: string;
};

export const createDefaultStandaloneRichTextWidget = ({
  id,
  pageLayoutTabId,
  body,
  position,
  objectMetadataId,
  title = 'Untitled Rich Text',
}: CreateDefaultStandaloneRichTextWidgetParams): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    universalIdentifier: id,
    isSystemSideEffect: false,
    pageLayoutTabId,
    title,
    isActive: true,
    type: WidgetType.STANDALONE_RICH_TEXT,
    configuration: {
      configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
      body,
    },
    position: isVerticalListPosition(position)
      ? { ...position, __typename: 'PageLayoutWidgetVerticalListPosition' }
      : { ...position, __typename: 'PageLayoutWidgetGridPosition' },
    objectMetadataId: objectMetadataId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
