import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isMicrosoftMessagingEnabledState = createAtomState<boolean>({
  key: 'isMicrosoftMessagingEnabled',
  defaultValue: false,
});
