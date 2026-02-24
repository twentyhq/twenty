import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isCurrentUserLoadedState = createStateV2<boolean>({
  key: 'isCurrentUserLoadedState',
  defaultValue: false,
});
