import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { isWorkspaceMemberMentionSearchResult } from '@/mention/utils/isWorkspaceMemberMentionSearchResult';

export const isTeammateMentionSearchResult = (
  item: Pick<MentionSearchResult, 'objectNameSingular'>,
) =>
  isWorkspaceMemberMentionSearchResult(item) ||
  item.objectNameSingular === AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR;
