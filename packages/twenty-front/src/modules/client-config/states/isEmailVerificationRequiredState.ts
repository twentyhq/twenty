import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isEmailVerificationRequiredState = createStateV2<boolean>({
  key: 'isEmailVerificationRequired',
  defaultValue: false,
});
