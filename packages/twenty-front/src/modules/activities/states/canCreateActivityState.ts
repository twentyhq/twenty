import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const canCreateActivityState = createState<boolean>({
  key: 'canCreateActivityState',
  defaultValue: false,
});
