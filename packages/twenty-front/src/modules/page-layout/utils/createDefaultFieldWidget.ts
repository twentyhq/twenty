import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
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
}): PageLayoutWidget => {
  return {
    __typename: 'PageLayoutWidget',
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
    gridPosition: {
      __typename: 'GridPosition',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 12,
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
