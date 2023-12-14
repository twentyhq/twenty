import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { ObjectRecordFilter } from '@/object-record/types/ObjectRecordFilter';

export const useRecordOptimisticEffect = ({
  objectMetadataItem,
  filter,
  orderBy,
  limit,
}: {
  objectMetadataItem: ObjectMetadataItem;
  filter?: ObjectRecordFilter;
  orderBy?: OrderByField;
  limit?: number;
}) => {};
