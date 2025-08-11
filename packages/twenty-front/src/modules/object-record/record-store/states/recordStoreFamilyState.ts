import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const recordStoreFamilyState = createFamilyState<
  ObjectRecord | null | undefined,
  string
>({
  key: 'recordStoreFamilyState',
  defaultValue: null,
});
