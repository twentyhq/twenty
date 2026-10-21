import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { isTeammateMentionSearchResult } from '@/mention/utils/isTeammateMentionSearchResult';
import { isWorkspaceMemberMentionSearchResult } from '@/mention/utils/isWorkspaceMemberMentionSearchResult';

export const groupMentionSearchResultsBySection = (
  items: MentionSearchResult[],
): MentionSearchResult[] => {
  const recordItems = items.filter(
    (item) => !isTeammateMentionSearchResult(item),
  );
  const objectNamesInRankOrder = [
    ...new Set(recordItems.map(({ objectNameSingular }) => objectNameSingular)),
  ];

  return [
    ...items.filter(
      (item) =>
        isTeammateMentionSearchResult(item) &&
        !isWorkspaceMemberMentionSearchResult(item),
    ),
    ...items.filter(isWorkspaceMemberMentionSearchResult),
    ...objectNamesInRankOrder.flatMap((objectNameSingular) =>
      recordItems.filter(
        (item) => item.objectNameSingular === objectNameSingular,
      ),
    ),
  ];
};
