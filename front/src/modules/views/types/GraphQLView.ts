import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';

export type GraphQLView = {
  id: string;
  name: string;
  objectMetadataId: string;
  viewFields: PaginatedObjectTypeResults<ViewField>;
  viewFilters: PaginatedObjectTypeResults<ViewFilter>;
  viewSorts: PaginatedObjectTypeResults<ViewSort>;
};
