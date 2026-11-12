import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatIsResolvingQuotedAuthorFamilyState =
  createAtomFamilyState<boolean, { threadId: string }>({
    key: 'agentChatIsResolvingQuotedAuthorFamilyState',
    defaultValue: false,
  });
