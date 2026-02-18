import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const settingsRolesIsLoadingStateV2 = createStateV2<boolean>({
  key: 'settingsRolesIsLoadingStateV2',
  defaultValue: true,
});
