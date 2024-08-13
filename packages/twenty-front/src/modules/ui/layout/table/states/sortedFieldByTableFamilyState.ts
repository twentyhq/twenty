import { OrderBy } from '@/types/OrderBy';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export type SortedFieldByTableFamilyStateValue = {
  fieldName: string;
  orderBy: OrderBy;
};

export type SortedFieldByTableFamilyStateKey = {
  tableId: string;
};

export const sortedFieldByTableFamilyState = createFamilyState<
  SortedFieldByTableFamilyStateValue | null,
  SortedFieldByTableFamilyStateKey
>({
  key: 'sortedFieldByTableFamilyState',
  defaultValue: null,
});
