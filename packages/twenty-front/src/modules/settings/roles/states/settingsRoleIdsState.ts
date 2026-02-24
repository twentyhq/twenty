import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const settingsRoleIdsState = createStateV2<string[]>({
  key: 'settingsRoleIdsState',
  defaultValue: [],
});
