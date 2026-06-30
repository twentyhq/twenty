import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type View as GqlView } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useHandleRecordGroupField = () => {
  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { getViewFromState } = useGetViewFromState();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const { performViewAPIUpdate } = usePerformViewAPIUpdate();
  const { canPersistChanges } = useCanPersistViewChanges();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const store = useStore();

  const handleRecordGroupFieldChange = useCallback(
    async (fieldMetadataItem: FieldMetadataItem) => {
      const currentViewId = store.get(currentViewIdCallbackState);

      if (!currentViewId) {
        return;
      }

      const view = getViewFromState(currentViewId);

      if (isUndefinedOrNull(view)) {
        return;
      }

      const isRelationGroupBy = isManyToOneRelationField(fieldMetadataItem);

      if (
        !isRelationGroupBy &&
        (isUndefinedOrNull(fieldMetadataItem.options) ||
          fieldMetadataItem.options.length === 0)
      ) {
        return;
      }

      if (canPersistChanges) {
        const updatedViewResult = await performViewAPIUpdate({
          id: view.id,
          input: {
            mainGroupByFieldMetadataId: fieldMetadataItem.id,
          },
        });

        if (updatedViewResult.status === 'successful') {
          const updatedView = updatedViewResult.response.data
            ?.updateView as GqlView;

          if (isDefined(updatedView)) {
            await loadRecordIndexStates(updatedView, objectMetadataItem);
          }
        }
      }

      const existingGroupKeys = new Set(
        view.viewGroups.map(
          (group) => `${view.mainGroupByFieldMetadataId}:${group.fieldValue}`,
        ),
      );

      const viewGroupsToCreate = (
        isRelationGroupBy ? [] : (fieldMetadataItem.options ?? [])
      )
        .filter(
          (option) =>
            !existingGroupKeys.has(`${fieldMetadataItem.id}:${option.value}`),
        )
        .sort((a, b) => a.value.localeCompare(b.value))
        .map(
          (option, index) =>
            ({
              id: v4(),
              fieldValue: option.value,
              isVisible: true,
              position: index,
            }) satisfies ViewGroup,
        );

      if (
        !existingGroupKeys.has(`${fieldMetadataItem.id}:`) &&
        fieldMetadataItem.isNullable === true
      ) {
        viewGroupsToCreate.push({
          id: v4(),
          fieldValue: '',
          isVisible: true,
          position: viewGroupsToCreate.length,
        } satisfies ViewGroup);
      }

      const isSameField =
        view.mainGroupByFieldMetadataId === fieldMetadataItem.id;
      const keptGroups = isSameField ? view.viewGroups : [];

      const newViewGroupsList = [...keptGroups, ...viewGroupsToCreate];

      setRecordGroupsFromViewGroups({
        viewId: view.id,
        mainGroupByFieldMetadataId: fieldMetadataItem.id,
        viewGroups: newViewGroupsList,
        objectMetadataItem,
      });
    },
    [
      currentViewIdCallbackState,
      canPersistChanges,
      getViewFromState,
      performViewAPIUpdate,
      setRecordGroupsFromViewGroups,
      objectMetadataItem,
      loadRecordIndexStates,
      store,
    ],
  );

  const resetRecordGroupField = useCallback(async () => {
    const currentViewId = store.get(currentViewIdCallbackState);

    if (!currentViewId) {
      return;
    }

    const view = getViewFromState(currentViewId);

    if (isUndefinedOrNull(view)) {
      return;
    }

    if (view.viewGroups.length === 0) {
      return;
    }

    if (canPersistChanges) {
      await performViewAPIUpdate({
        id: view.id,
        input: {
          mainGroupByFieldMetadataId: null,
        },
      });
    }

    setRecordGroupsFromViewGroups({
      viewId: view.id,
      mainGroupByFieldMetadataId: '',
      viewGroups: [],
      objectMetadataItem,
    });
  }, [
    currentViewIdCallbackState,
    canPersistChanges,
    getViewFromState,
    performViewAPIUpdate,
    setRecordGroupsFromViewGroups,
    objectMetadataItem,
    store,
  ]);

  return { handleRecordGroupFieldChange, resetRecordGroupField };
};
