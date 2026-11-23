import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type BrowsingContext } from '@/ai-chat/types/BrowsingContext';

export const aiChatThreadReplyLastBrowsingContextFamilyState =
  createAtomFamilyState<BrowsingContext | null | undefined, string>({
    key: 'aiChatThreadReplyLastBrowsingContextFamilyState',
    defaultValue: undefined,
  });
