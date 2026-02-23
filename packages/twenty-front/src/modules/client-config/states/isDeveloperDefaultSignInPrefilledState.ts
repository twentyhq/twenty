import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isDeveloperDefaultSignInPrefilledState = createStateV2<boolean>({
  key: 'isDeveloperDefaultSignInPrefilledState',
  defaultValue: false,
});
