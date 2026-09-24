import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
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
}: CreateDefaultStandaloneRichTextWidgetParams): PageLayoutWidget =>
  buildDraftPageLayoutWidget({
    id,
    pageLayoutTabId,
    title,
    type: WidgetType.STANDALONE_RICH_TEXT,
    configuration: {
      configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
      body,
    },
    position,
    objectMetadataId,
  });
