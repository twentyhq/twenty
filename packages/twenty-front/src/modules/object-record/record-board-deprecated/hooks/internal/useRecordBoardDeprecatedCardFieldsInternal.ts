import { useCallback } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { RecordBoardDeprecatedScopeInternalContext } from '@/object-record/record-board-deprecated/scopes/scope-internal-context/RecordBoardDeprecatedScopeInternalContext';
import { onFieldsChangeScopedState } from '@/object-record/record-board-deprecated/states/onFieldsChangeScopedState';
import { recordBoardCardFieldsScopedState } from '@/object-record/record-board-deprecated/states/recordBoardDeprecatedCardFieldsScopedState';
import { savedRecordBoardDeprecatedCardFieldsScopedState } from '@/object-record/record-board-deprecated/states/savedRecordBoardDeprecatedCardFieldsScopedState';
import { BoardFieldDefinition } from '@/object-record/record-board-deprecated/types/BoardFieldDefinition';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRecordBoardDeprecatedCardFieldsInternalProps = {
  recordBoardScopeId?: string;
};

export const useRecordBoardDeprecatedCardFieldsInternal = (
  props?: useRecordBoardDeprecatedCardFieldsInternalProps,
) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardDeprecatedScopeInternalContext,
    props?.recordBoardScopeId,
  );

  const setBoardCardFields = useSetRecoilState(
    recordBoardCardFieldsScopedState({ scopeId }),
  );

  const setSavedBoardCardFields = useSetRecoilState(
    savedRecordBoardDeprecatedCardFieldsScopedState({ scopeId }),
  );

  const handleFieldVisibilityChange = useRecoilCallback(
    ({ snapshot }) =>
      async (
        field: Omit<ColumnDefinition<FieldMetadata>, 'size' | 'position'>,
      ) => {
        const existingFields = await snapshot
          .getLoadable(recordBoardCardFieldsScopedState({ scopeId }))
          .getValue();

        const fieldIndex = existingFields.findIndex(
          ({ fieldMetadataId }) => field.fieldMetadataId === fieldMetadataId,
        );
        const fields = [...existingFields];

        if (fieldIndex === -1) {
          fields.push({ ...field, position: existingFields.length });
        } else {
          fields[fieldIndex] = {
            ...field,
            isVisible: !field.isVisible,
            position: existingFields.length,
          };
        }

        setSavedBoardCardFields(fields);
        setBoardCardFields(fields);

        const onFieldsChange = snapshot
          .getLoadable(onFieldsChangeScopedState({ scopeId }))
          .getValue();

        onFieldsChange?.(fields);
      },
    [scopeId, setBoardCardFields, setSavedBoardCardFields],
  );

  const handleFieldsChange = useRecoilCallback(
    ({ snapshot }) =>
      async (fields: BoardFieldDefinition<FieldMetadata>[]) => {
        setSavedBoardCardFields(fields);
        setBoardCardFields(fields);

        const onFieldsChange = snapshot
          .getLoadable(onFieldsChangeScopedState({ scopeId }))
          .getValue();

        await onFieldsChange?.(fields);
      },
    [scopeId, setBoardCardFields, setSavedBoardCardFields],
  );

  const handleFieldsReorder = useCallback(
    async (fields: BoardFieldDefinition<FieldMetadata>[]) => {
      const updatedFields = fields.map((column, index) => ({
        ...column,
        position: index,
      }));

      await handleFieldsChange(updatedFields);
    },
    [handleFieldsChange],
  );

  return { handleFieldVisibilityChange, handleFieldsReorder };
};
