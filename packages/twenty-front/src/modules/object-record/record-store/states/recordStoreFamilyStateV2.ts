import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

// Jotai V2 equivalent of `recordStoreFamilyState`.
// During migration, both Recoil and Jotai versions coexist.
// Writers update both; migrated readers use this V2 version.
export const recordStoreFamilyStateV2 = createFamilyStateV2<
  ObjectRecord | null | undefined,
  string
>({
  key: 'recordStoreFamilyStateV2',
  defaultValue: null,
});
