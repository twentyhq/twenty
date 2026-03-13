import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasTriggeredCreateForDraftState = createAtomState<boolean>({
  key: 'ai/hasTriggeredCreateForDraftState',
  defaultValue: false,
});
