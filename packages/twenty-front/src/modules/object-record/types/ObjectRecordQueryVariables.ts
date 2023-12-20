import { OrderByField } from '@/object-metadata/types/OrderByField';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';

export type ObjectRecordQueryVariables = {
  filter?: ObjectRecordQueryFilter;
  orderBy?: OrderByField;
  limit?: number;
};
