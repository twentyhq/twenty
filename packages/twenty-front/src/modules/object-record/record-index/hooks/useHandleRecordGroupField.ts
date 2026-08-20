import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useHandleRecordGroupField = () => {
  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { getViewFromState } = useGetViewFromState();

  const { performViewAPIUpdate } = usePerformViewAPIUpdate();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const store = useStore();

  const updateViewMainGroupByFieldMetadataId = useCallback(
    async ({
      viewId,
      mainGroupByFieldMetadataId,
    }: {
      viewId: string;
      mainGroupByFieldMetadataId: string | null;
    }) => {
      const updatedViewResult = await performViewAPIUpdate({
        id: viewId,
        input: {
          mainGroupByFieldMetadataId,
        },
      });

      if (updatedViewResult.status !== 'successful') {
        return;
      }

      const updatedView = updatedViewResult.response.data?.updateView;

      if (!isDefined(updatedView)) {
        return;
      }

      loadRecordIndexStates(updatedView, objectMetadataItem);
    },
    [performViewAPIUpdate, loadRecordIndexStates, objectMetadataItem],
  );

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

      await updateViewMainGroupByFieldMetadataId({
        viewId: view.id,
        mainGroupByFieldMetadataId: fieldMetadataItem.id,
      });
    },
    [
      currentViewIdCallbackState,
      getViewFromState,
      updateViewMainGroupByFieldMetadataId,
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

    if (!isDefined(view.mainGroupByFieldMetadataId)) {
      return;
    }

    await updateViewMainGroupByFieldMetadataId({
      viewId: view.id,
      mainGroupByFieldMetadataId: null,
    });
  }, [
    currentViewIdCallbackState,
    getViewFromState,
    updateViewMainGroupByFieldMetadataId,
    store,
  ]);

  return { handleRecordGroupFieldChange, resetRecordGroupField };
};
