import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCreatingForFirstSendState = createAtomState<boolean>({
  key: 'ai/isCreatingForFirstSendState',
  defaultValue: false,
});
