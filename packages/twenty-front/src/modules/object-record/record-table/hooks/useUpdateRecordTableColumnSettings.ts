import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { getViewFieldSettingsInput } from '@/views/utils/getViewFieldSettingsInput';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ViewFieldSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateRecordTableColumnSettings = () => {
  const store = useStore();
  const { performViewFieldApiUpdate } = usePerformViewFieldApiPersist();

  const updateRecordTableColumnSettings = useCallback(
    async ({
      recordTableId,
      recordFieldId,
      settings,
    }: {
      recordTableId: string;
      recordFieldId: string;
      settings: ViewFieldSettings | null;
    }) => {
      const currentRecordFieldsAtom =
        currentRecordFieldsComponentState.atomFamily({
          instanceId: recordTableId,
        });

      const recordFieldToUpdate = store
        .get(currentRecordFieldsAtom)
        .find((recordField) => recordField.id === recordFieldId);

      if (!isDefined(recordFieldToUpdate)) {
        return;
      }

      store.set(currentRecordFieldsAtom, (previousRecordFields) =>
        previousRecordFields.map((recordField) =>
          recordField.id === recordFieldToUpdate.id
            ? { ...recordField, settings }
            : recordField,
        ),
      );

      await performViewFieldApiUpdate([
        {
          input: {
            id: recordFieldToUpdate.id,
            update: { settings: getViewFieldSettingsInput(settings) },
          },
        },
      ]);
    },
    [performViewFieldApiUpdate, store],
  );

  return { updateRecordTableColumnSettings };
};
