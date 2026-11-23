import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { buildAddedRecordField } from '@/object-record/record-field/utils/buildAddedRecordField';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { useStore } from 'jotai';
import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Saved before the table changes, so a column the server rejects never shows
export const useSaveScopedRelationColumn = (recordTableId: string) => {
  const store = useStore();
  const currentRecordFieldsCallbackState = useAtomComponentStateCallbackState(
    currentRecordFieldsComponentState,
    recordTableId,
  );
  const { saveViewFields } = useSaveCurrentViewFields();
  const { upsertRecordField } = useUpsertRecordField(recordTableId);

  const saveScopedRelationColumn = async ({
    fieldMetadataItemId,
    recordFieldId,
    relationScope,
    relationTargetFieldMetadataId,
    label,
  }: {
    fieldMetadataItemId: string;
    recordFieldId?: string;
    relationScope: ViewFieldRelationScope;
    relationTargetFieldMetadataId: string | null;
    label: string | null;
  }): Promise<boolean> => {
    const currentRecordFields = store.get(currentRecordFieldsCallbackState);
    const recordFieldToSave = isDefined(recordFieldId)
      ? currentRecordFields.find(({ id }) => id === recordFieldId)
      : buildAddedRecordField({ currentRecordFields, fieldMetadataItemId });

    if (!isDefined(recordFieldToSave)) {
      return false;
    }

    const savedRecordField = {
      ...recordFieldToSave,
      relationScope,
      relationTargetFieldMetadataId,
      label,
    };

    const isSaved = await saveViewFields([
      mapRecordFieldToViewField(savedRecordField),
    ]);

    if (isSaved) {
      upsertRecordField(savedRecordField);
    }

    return isSaved;
  };

  return { saveScopedRelationColumn };
};
