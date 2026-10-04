import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { isWorkspaceMemberMentionSearchResult } from '@/mention/utils/isWorkspaceMemberMentionSearchResult';

// Teammates lead, then each object in the order search ranked its first match
export const groupMentionSearchResultsBySection = ({
  items,
  teammateLimit,
}: {
  items: MentionSearchResult[];
  teammateLimit: number;
}): MentionSearchResult[] => {
  const teammateItems = items
    .filter(isWorkspaceMemberMentionSearchResult)
    .slice(0, teammateLimit);
  const recordItems = items.filter(
    (item) => !isWorkspaceMemberMentionSearchResult(item),
  );
  const objectNamesInRankOrder = [
    ...new Set(recordItems.map(({ objectNameSingular }) => objectNameSingular)),
  ];

  return [
    ...teammateItems,
    ...objectNamesInRankOrder.flatMap((objectNameSingular) =>
      recordItems.filter(
        (item) => item.objectNameSingular === objectNameSingular,
      ),
    ),
  ];
};
