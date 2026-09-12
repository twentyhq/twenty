import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
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
}): PageLayoutWidget =>
  buildDraftPageLayoutWidget({
    id,
    pageLayoutTabId,
    title: 'Fields',
    type: WidgetType.FIELDS,
    configuration: {
      __typename: 'FieldsConfiguration',
      configurationType: WidgetConfigurationType.FIELDS,
      viewId,
      newFieldDefaultVisibility: true,
    },
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: positionIndex,
    },
    objectMetadataId,
  });
