import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';

// The server diffs the scope by id, so dropping the previous children keeps only those it returns
export const getScopeViewItemsToRemoveFromDraft = ({
  previousScopeView,
  nextScopeViewId,
}: {
  previousScopeView: {
    id: string;
    viewFilters: { id: string }[];
    viewFilterGroups?: { id: string }[];
    viewSorts: { id: string }[];
  };
  nextScopeViewId: string | undefined;
}): { key: MetadataEntityKey; itemIds: string[] }[] => [
  {
    key: 'viewFilters',
    itemIds: previousScopeView.viewFilters.map(({ id }) => id),
  },
  {
    key: 'viewFilterGroups',
    itemIds: (previousScopeView.viewFilterGroups ?? []).map(({ id }) => id),
  },
  {
    key: 'viewSorts',
    itemIds: previousScopeView.viewSorts.map(({ id }) => id),
  },
  {
    key: 'views',
    itemIds:
      previousScopeView.id === nextScopeViewId ? [] : [previousScopeView.id],
  },
];
