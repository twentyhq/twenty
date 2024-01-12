import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';

export type GraphQLView = {
  id: string;
  name: string;
  objectMetadataId: string;
  viewFields: ViewField[];
  viewFilters: ViewFilter[];
  viewSorts: ViewSort[];
};
