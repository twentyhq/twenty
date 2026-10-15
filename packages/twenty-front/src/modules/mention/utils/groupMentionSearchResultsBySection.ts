import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { isWorkspaceMemberMentionSearchResult } from '@/mention/utils/isWorkspaceMemberMentionSearchResult';

const isAssistantMentionSearchResult = ({
  objectNameSingular,
}: MentionSearchResult) =>
  objectNameSingular === AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR;

export const groupMentionSearchResultsBySection = (
  items: MentionSearchResult[],
): MentionSearchResult[] => {
  const recordItems = items.filter(
    (item) =>
      !isWorkspaceMemberMentionSearchResult(item) &&
      !isAssistantMentionSearchResult(item),
  );
  const objectNamesInRankOrder = [
    ...new Set(recordItems.map(({ objectNameSingular }) => objectNameSingular)),
  ];

  return [
    ...items.filter(isAssistantMentionSearchResult),
    ...items.filter(isWorkspaceMemberMentionSearchResult),
    ...objectNamesInRankOrder.flatMap((objectNameSingular) =>
      recordItems.filter(
        (item) => item.objectNameSingular === objectNameSingular,
      ),
    ),
  ];
};
