import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const recordStoreFamilyState = createFamilyStateV2<
  ObjectRecord | null | undefined,
  string
>({
  key: 'recordStoreFamilyState',
  defaultValue: null,
});
