import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const recordStoreFamilyStateV2 = createFamilyStateV2<
  ObjectRecord | null | undefined,
  string
>({
  key: 'recordStoreFamilyStateV2',
  defaultValue: null,
});
