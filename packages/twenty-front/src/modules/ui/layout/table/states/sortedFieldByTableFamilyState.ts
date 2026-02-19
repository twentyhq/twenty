import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export type SortedFieldByTableFamilyStateKey = {
  tableId: string;
};

export const sortedFieldByTableFamilyState = createFamilyStateV2<
  TableSortValue | null,
  SortedFieldByTableFamilyStateKey
>({
  key: 'sortedFieldByTableFamilyState',
  defaultValue: null,
});
