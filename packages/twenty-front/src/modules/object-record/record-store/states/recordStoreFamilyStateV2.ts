import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const recordStoreFamilyStateV2 = createAtomFamilyState<
  ObjectRecord | null | undefined,
  string
>({
  key: 'recordStoreFamilyStateV2',
  defaultValue: null,
});
