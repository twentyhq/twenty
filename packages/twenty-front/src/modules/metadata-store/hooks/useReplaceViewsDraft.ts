import { type VIEW_METADATA_ENTITY_KEYS } from '@/metadata-store/constants/ViewMetadataEntityKeys';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { getDraftOrCurrentMetadataItems } from '@/metadata-store/utils/getDraftOrCurrentMetadataItems';
import { type splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type ViewChildEntityKey = Exclude<
  (typeof VIEW_METADATA_ENTITY_KEYS)[number],
  'views'
>;

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
      const replaceChildrenDraft = <TKey extends ViewChildEntityKey>({
        key,
        addedChildren = [],
      }: {
        key: TKey;
        addedChildren?: MetadataEntityTypeMap[TKey][];
      }) =>
        replaceDraft(key, [
          ...getDraftOrCurrentMetadataItems({
            store,
            metadataEntityKey: key,
          }).filter((child) => viewIdsKeepingChildren.has(child.viewId)),
          ...addedChildren,
        ]);

      replaceDraft('views', views);
      replaceChildrenDraft({
        key: 'viewFields',
        addedChildren: addedViewChildren?.flatViewFields,
      });
      replaceChildrenDraft({
        key: 'viewFilters',
        addedChildren: addedViewChildren?.flatViewFilters,
      });
      replaceChildrenDraft({
        key: 'viewSorts',
        addedChildren: addedViewChildren?.flatViewSorts,
      });
      replaceChildrenDraft({
        key: 'viewGroups',
        addedChildren: addedViewChildren?.flatViewGroups,
      });
      replaceChildrenDraft({
        key: 'viewFilterGroups',
        addedChildren: addedViewChildren?.flatViewFilterGroups,
      });
      replaceChildrenDraft({
        key: 'viewFieldGroups',
        addedChildren: addedViewChildren?.flatViewFieldGroups,
      });
    },
    [store, replaceDraft],
  );

  return { replaceViewsDraft };
};
