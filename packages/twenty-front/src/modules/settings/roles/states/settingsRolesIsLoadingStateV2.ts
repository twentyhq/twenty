import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const settingsRolesIsLoadingStateV2 = createState<boolean>({
  key: 'settingsRolesIsLoadingStateV2',
  defaultValue: true,
});
