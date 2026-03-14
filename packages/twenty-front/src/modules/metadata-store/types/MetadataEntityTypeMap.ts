import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type LogicFunction } from '@/settings/logic-functions/states/logicFunctionsState';
import { type View } from '@/views/types/View';
import { type ViewField } from '@/views/types/ViewField';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewSort } from '@/views/types/ViewSort';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type MetadataEntityTypeMap = {
  objectMetadataItems: FlatObjectMetadataItem;
  fieldMetadataItems: FlatFieldMetadataItem;
  indexMetadataItems: FlatIndexMetadataItem;
  views: View;
  viewFields: ViewField;
  viewFilters: ViewFilter;
  viewSorts: ViewSort;
  pageLayouts: PageLayout;
  logicFunctions: LogicFunction;
  navigationMenuItems: NavigationMenuItem;
};
