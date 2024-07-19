import { SerializableParam } from 'recoil';

import { OrderBy } from '@/object-metadata/types/OrderBy';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

type TableSortState = {
  fieldName: string;
  orderBy: OrderBy | null;
};

type TableSortFamilyKey = {
  tableId: string;
  initialFieldName: string;
} & SerializableParam;

const getDefaultTableSortState = ({
  initialFieldName,
}: TableSortFamilyKey): TableSortState => ({
  fieldName: initialFieldName,
  orderBy: 'AscNullsLast' as OrderBy,
});

export const tableSortFamilyState = createFamilyState<
  TableSortState,
  TableSortFamilyKey
>({
  key: 'tableSortFamilyState',
  defaultValue: getDefaultTableSortState as TableSortState,
});
