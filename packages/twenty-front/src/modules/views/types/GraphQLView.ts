import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';
import { ViewType } from '@/views/types/ViewType';

export type GraphQLView = {
  id: string;
  name: string;
  type: ViewType;
  objectMetadataId: string;
  viewFields: ViewField[];
  viewFilters: ViewFilter[];
  viewSorts: ViewSort[];
};
