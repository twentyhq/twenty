import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatIsStreamingFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string | null }
>({
  key: 'agentChatIsStreamingFamilyState',
  defaultValue: false,
});
