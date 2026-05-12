import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type FlatViewFieldGroup } from '@/metadata-store/types/FlatViewFieldGroup';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export type CloneViewResult = {
  newViewId: string;
  copiedViewFieldGroups: FlatViewFieldGroup[];
  copiedViewFields: FlatViewField[];
};

export const useCloneViewInMetadataStore = () => {
  const store = useStore();
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const cloneView = useCallback(
    (sourceViewId: string): CloneViewResult | null => {
      const flatViews = store.get(metadataStoreState.atomFamily('views'))
        .current as FlatView[];
      const allFlatViewFields = store.get(
        metadataStoreState.atomFamily('viewFields'),
      ).current as FlatViewField[];
      const allFlatViewFieldGroups = store.get(
        metadataStoreState.atomFamily('viewFieldGroups'),
      ).current as FlatViewFieldGroup[];

      const sourceView = flatViews.find((view) => view.id === sourceViewId);

      if (!isDefined(sourceView)) {
        return null;
      }

      const sourceViewFields = allFlatViewFields.filter(
        (field) => field.viewId === sourceViewId && field.isActive,
      );
      const sourceViewFieldGroups = allFlatViewFieldGroups.filter(
        (group) => group.viewId === sourceViewId && group.isActive,
      );

      const newViewId = uuidv4();

      const oldGroupIdToNewGroupId = new Map<string, string>();

      for (const group of sourceViewFieldGroups) {
        oldGroupIdToNewGroupId.set(group.id, uuidv4());
      }

      const copiedView: FlatView = {
        ...sourceView,
        id: newViewId,
      };

      const copiedViewFieldGroups: FlatViewFieldGroup[] =
        sourceViewFieldGroups.map((group) => ({
          ...group,
          id: oldGroupIdToNewGroupId.get(group.id) ?? uuidv4(),
          viewId: newViewId,
        }));

      const copiedViewFields: FlatViewField[] = sourceViewFields.map(
        (field) => ({
          ...field,
          id: uuidv4(),
          viewId: newViewId,
          viewFieldGroupId: isDefined(field.viewFieldGroupId)
            ? (oldGroupIdToNewGroupId.get(field.viewFieldGroupId) ?? null)
            : field.viewFieldGroupId,
        }),
      );

      addToDraft({ key: 'views', items: [copiedView] });

      applyChanges();

      return { newViewId, copiedViewFieldGroups, copiedViewFields };
    },
    [addToDraft, applyChanges, store],
  );

  return { cloneView };
};
