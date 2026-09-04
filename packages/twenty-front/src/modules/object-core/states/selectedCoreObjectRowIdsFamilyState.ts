import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type SelectedCoreObjectRowIdsFamilyStateKey = {
  tableId: string;
};

export const selectedCoreObjectRowIdsFamilyState = createAtomFamilyState<
  string[],
  SelectedCoreObjectRowIdsFamilyStateKey
>({
  key: 'selectedCoreObjectRowIdsFamilyState',
  defaultValue: [],
});
