import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatThreadListLoadCountFamilyState = createAtomFamilyState<
  number,
  string
>({
  key: 'agentChatThreadListLoadCountFamilyState',
  defaultValue: 0,
});
