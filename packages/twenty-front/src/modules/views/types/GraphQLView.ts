import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';

export type GraphQLView = {
  id: string;
  name: string;
  objectMetadataId: string;
  viewFields: ObjectRecordConnection<ViewField>;
  viewFilters: ObjectRecordConnection<ViewFilter>;
  viewSorts: ObjectRecordConnection<ViewSort>;
};
