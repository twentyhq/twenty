import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import {
  FieldDisplayMode,
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const createDefaultFieldWidget = ({
  id,
  pageLayoutTabId,
  title,
  fieldMetadataId,
  fieldDisplayMode = FieldDisplayMode.CARD,
  objectMetadataId,
  positionIndex,
}: {
  id: string;
  pageLayoutTabId: string;
  title: string;
  fieldMetadataId: string;
  fieldDisplayMode?: FieldDisplayMode;
  objectMetadataId: string;
  positionIndex: number;
}): PageLayoutWidget =>
  buildDraftPageLayoutWidget({
    id,
    pageLayoutTabId,
    title,
    type: WidgetType.FIELD,
    configuration: {
      __typename: 'FieldConfiguration',
      configurationType: WidgetConfigurationType.FIELD,
      fieldMetadataId,
      fieldDisplayMode,
    },
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: positionIndex,
    },
    objectMetadataId,
  });
