import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatIsUserMessageExpandedFamilyState = createAtomFamilyState<
  boolean,
  { messageId: string }
>({
  key: 'agentChatIsUserMessageExpandedFamilyState',
  defaultValue: false,
});
