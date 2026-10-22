import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useStore } from 'jotai';
import { useEffect } from 'react';

const MOUNTED_PICKERS_BY_STORE = new WeakMap<
  ReturnType<typeof useStore>,
  Map<string, number>
>();

export const MultipleRecordPickerSessionEffect = () => {
  const store = useStore();
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  useEffect(() => {
    const mountedPickers =
      MOUNTED_PICKERS_BY_STORE.get(store) ?? new Map<string, number>();
    MOUNTED_PICKERS_BY_STORE.set(store, mountedPickers);
    mountedPickers.set(instanceId, (mountedPickers.get(instanceId) ?? 0) + 1);

    return () => {
      const ownerCount = (mountedPickers.get(instanceId) ?? 1) - 1;
      mountedPickers.set(instanceId, ownerCount);

      queueMicrotask(() => {
        if ((mountedPickers.get(instanceId) ?? 0) > 0) {
          return;
        }

        mountedPickers.delete(instanceId);
        store.set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId,
          }),
          [],
        );
        store.set(
          multipleRecordPickerSearchFilterComponentState.atomFamily({
            instanceId,
          }),
          '',
        );
      });
    };
  }, [instanceId, store]);

  return null;
};
