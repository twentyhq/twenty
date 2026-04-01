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
  objectMetadataId,
  positionIndex,
}: {
  id: string;
  pageLayoutTabId: string;
  title: string;
  fieldMetadataId: string;
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
      fieldDisplayMode: FieldDisplayMode.CARD,
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
    isOverridden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
};
