import { useCallback } from 'react';
import { useStore } from 'jotai';

import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import {
  type RecordPickerOnChange,
  type RecordPickerPickableMorphItem,
} from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isErrorLike } from '@apollo/client/errors';

const getMorphItemKey = ({
  objectMetadataId,
  recordId,
}: Pick<RecordPickerPickableMorphItem, 'objectMetadataId' | 'recordId'>) =>
  `${objectMetadataId}:${recordId}`;

type PickerMorphItemChangeQueue = {
  confirmedIsSelected: boolean;
  latestChangeToken: symbol;
  pendingChange: Promise<void>;
};

const changeQueueByPickerMorphItemKey = new Map<
  string,
  PickerMorphItemChangeQueue
>();

export const useMultipleRecordPickerChange = ({
  onChange,
}: {
  onChange?: RecordPickerOnChange;
}) => {
  const store = useStore();
  const { enqueueErrorSnackBar } = useSnackBar();
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const pickableMorphItemsState = useAtomComponentStateCallbackState(
    multipleRecordPickerPickableMorphItemsComponentState,
    componentInstanceId,
  );

  const handleChange = useCallback(
    (morphItem: RecordPickerPickableMorphItem) => {
      const morphItemKey = getMorphItemKey(morphItem);
      const pickerMorphItemKey = `${componentInstanceId}:${morphItemKey}`;
      const changeToken = Symbol(morphItemKey);
      const previousMorphItems = store.get(pickableMorphItemsState);
      const previousMorphItem = previousMorphItems.find(
        (item) => getMorphItemKey(item) === morphItemKey,
      );
      const existingChangeQueue =
        changeQueueByPickerMorphItemKey.get(pickerMorphItemKey);
      const confirmedIsSelected =
        existingChangeQueue?.confirmedIsSelected ??
        previousMorphItem?.isSelected ??
        false;

      const nextMorphItems = previousMorphItems.some(
        (item) => getMorphItemKey(item) === morphItemKey,
      )
        ? previousMorphItems.map((item) =>
            getMorphItemKey(item) === morphItemKey ? morphItem : item,
          )
        : [...previousMorphItems, morphItem];

      store.set(pickableMorphItemsState, nextMorphItems);

      const runOnChange = () => {
        try {
          return Promise.resolve(onChange?.(morphItem));
        } catch (error) {
          return Promise.reject(error);
        }
      };

      const currentChange = existingChangeQueue
        ? existingChangeQueue.pendingChange
            .catch(() => undefined)
            .then(runOnChange)
        : runOnChange();

      changeQueueByPickerMorphItemKey.set(pickerMorphItemKey, {
        confirmedIsSelected,
        latestChangeToken: changeToken,
        pendingChange: currentChange,
      });

      return currentChange.then(
        () => {
          const currentChangeQueue =
            changeQueueByPickerMorphItemKey.get(pickerMorphItemKey);

          if (!currentChangeQueue) {
            return;
          }

          currentChangeQueue.confirmedIsSelected = morphItem.isSelected;

          if (currentChangeQueue.pendingChange === currentChange) {
            changeQueueByPickerMorphItemKey.delete(pickerMorphItemKey);
          }
        },
        (error: unknown) => {
          const currentChangeQueue =
            changeQueueByPickerMorphItemKey.get(pickerMorphItemKey);
          const isLatestChange =
            currentChangeQueue?.latestChangeToken === changeToken;

          if (isLatestChange && currentChangeQueue !== undefined) {
            store.set(pickableMorphItemsState, (currentMorphItems) =>
              currentMorphItems.map((currentMorphItem) =>
                getMorphItemKey(currentMorphItem) === morphItemKey &&
                currentMorphItem.isSelected === morphItem.isSelected
                  ? {
                      ...currentMorphItem,
                      isSelected: currentChangeQueue.confirmedIsSelected,
                    }
                  : currentMorphItem,
              ),
            );
          }

          if (currentChangeQueue?.pendingChange === currentChange) {
            changeQueueByPickerMorphItemKey.delete(pickerMorphItemKey);
          }

          if (isLatestChange) {
            enqueueErrorSnackBar(
              isErrorLike(error)
                ? { apolloError: error }
                : error instanceof Error
                  ? { message: error.message }
                  : {},
            );
          }
        },
      );
    },
    [
      componentInstanceId,
      enqueueErrorSnackBar,
      onChange,
      pickableMorphItemsState,
      store,
    ],
  );

  return { handleChange };
};
