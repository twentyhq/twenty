import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const settingsRoleIdsState = createState<string[]>({
  key: 'settingsRoleIdsState',
  defaultValue: [],
});
