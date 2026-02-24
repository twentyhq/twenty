import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const recordLoadingFamilyState = createFamilyStateV2<boolean, string>({
  key: 'recordLoadingFamilyState',
  defaultValue: false,
});
