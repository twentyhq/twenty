import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
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
  viewId,
  objectMetadataId,
  positionIndex,
}: {
  id: string;
  pageLayoutTabId: string;
  title: string;
  fieldMetadataId: string;
  fieldDisplayMode?: FieldDisplayMode;
  viewId?: string;
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
      ...(isDefined(viewId) && { viewId }),
    },
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: positionIndex,
    },
    objectMetadataId,
  });
