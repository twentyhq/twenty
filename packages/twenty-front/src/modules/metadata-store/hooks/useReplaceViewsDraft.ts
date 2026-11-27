import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { getDraftOrCurrentMetadataItems } from '@/metadata-store/utils/getDraftOrCurrentMetadataItems';
import { type splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type ViewChildEntityKey =
  | 'viewFields'
  | 'viewFilters'
  | 'viewSorts'
  | 'viewGroups'
  | 'viewFilterGroups'
  | 'viewFieldGroups';

export type AddedViewChildren = Omit<
  ReturnType<typeof splitViewWithRelated>,
  'flatViews'
>;

export const useReplaceViewsDraft = () => {
  const store = useStore();
  const { replaceDraft } = useUpdateMetadataStoreDraft();

  const replaceViewsDraft = useCallback(
    ({
      views,
      viewIdsKeepingChildren,
      addedViewChildren,
    }: {
      views: FlatView[];
      viewIdsKeepingChildren: Set<string>;
      addedViewChildren?: AddedViewChildren;
    }) => {
      const replaceChildrenDraft = <TKey extends ViewChildEntityKey>(
        key: TKey,
        addedChildren: MetadataEntityTypeMap[TKey][] = [],
      ) =>
        replaceDraft(key, [
          ...getDraftOrCurrentMetadataItems({
            store,
            metadataEntityKey: key,
          }).filter((child) => viewIdsKeepingChildren.has(child.viewId)),
          ...addedChildren,
        ]);

      replaceDraft('views', views);
      replaceChildrenDraft('viewFields', addedViewChildren?.flatViewFields);
      replaceChildrenDraft('viewFilters', addedViewChildren?.flatViewFilters);
      replaceChildrenDraft('viewSorts', addedViewChildren?.flatViewSorts);
      replaceChildrenDraft('viewGroups', addedViewChildren?.flatViewGroups);
      replaceChildrenDraft(
        'viewFilterGroups',
        addedViewChildren?.flatViewFilterGroups,
      );
      replaceChildrenDraft(
        'viewFieldGroups',
        addedViewChildren?.flatViewFieldGroups,
      );
    },
    [store, replaceDraft],
  );

  return { replaceViewsDraft };
};
