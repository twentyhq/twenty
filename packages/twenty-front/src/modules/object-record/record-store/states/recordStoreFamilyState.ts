import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const recordStoreFamilyState = createAtomFamilyState<
  ObjectRecord | null | undefined,
  string
>({
  key: 'recordStoreFamilyState',
  defaultValue: null,
});
