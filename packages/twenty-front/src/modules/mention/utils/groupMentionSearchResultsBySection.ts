import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { isWorkspaceMemberMentionSearchResult } from '@/mention/utils/isWorkspaceMemberMentionSearchResult';

export const groupMentionSearchResultsBySection = (
  items: MentionSearchResult[],
): MentionSearchResult[] => {
  const recordItems = items.filter(
    (item) => !isWorkspaceMemberMentionSearchResult(item),
  );
  const objectNamesInRankOrder = [
    ...new Set(recordItems.map(({ objectNameSingular }) => objectNameSingular)),
  ];

  return [
    ...items.filter(isWorkspaceMemberMentionSearchResult),
    ...objectNamesInRankOrder.flatMap((objectNameSingular) =>
      recordItems.filter(
        (item) => item.objectNameSingular === objectNameSingular,
      ),
    ),
  ];
};
