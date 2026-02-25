import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isGoogleMessagingEnabledState = createAtomState<boolean>({
  key: 'isGoogleMessagingEnabled',
  defaultValue: false,
});
