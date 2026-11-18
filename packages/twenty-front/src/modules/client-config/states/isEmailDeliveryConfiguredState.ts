import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isEmailDeliveryConfiguredState = createAtomState<boolean>({
  key: 'isEmailDeliveryConfigured',
  defaultValue: true,
});
