import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const recordStoreFamilyStateV2 = createFamilyState<
  ObjectRecord | null | undefined,
  string
>({
  key: 'recordStoreFamilyStateV2',
  defaultValue: null,
});
