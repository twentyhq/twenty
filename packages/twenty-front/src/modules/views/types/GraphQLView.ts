import { PaginatedRecordTypeResults } from '@/object-record/types/PaginatedRecordTypeResults';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';

export type GraphQLView = {
  id: string;
  name: string;
  objectMetadataId: string;
  viewFields: PaginatedRecordTypeResults<ViewField>;
  viewFilters: PaginatedRecordTypeResults<ViewFilter>;
  viewSorts: PaginatedRecordTypeResults<ViewSort>;
};
