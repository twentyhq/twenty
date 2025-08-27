import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type SortedFieldByTableFamilyStateKey = {
  tableId: string;
};

export const sortedFieldByTableFamilyState = createFamilyState<
  TableSortValue | null,
  SortedFieldByTableFamilyStateKey
>({
  key: 'sortedFieldByTableFamilyState',
  defaultValue: null,
});
