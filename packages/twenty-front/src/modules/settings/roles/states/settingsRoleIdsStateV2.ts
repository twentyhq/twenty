import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const settingsRoleIdsStateV2 = createStateV2<string[]>({
  key: 'settingsRoleIdsStateV2',
  defaultValue: [],
});
