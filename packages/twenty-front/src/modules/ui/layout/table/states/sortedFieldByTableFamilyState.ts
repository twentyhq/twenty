import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type SortedFieldByTableFamilyStateKey = {
  tableId: string;
};

export const sortedFieldByTableFamilyState = createAtomFamilyState<
  TableSortValue | null,
  SortedFieldByTableFamilyStateKey
>({
  key: 'sortedFieldByTableFamilyState',
  defaultValue: null,
});
