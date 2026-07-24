import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatExpandedReturnLocationState = createAtomState<string | null>(
  {
    key: 'aiChatExpandedReturnLocationState',
    defaultValue: null,
  },
);
