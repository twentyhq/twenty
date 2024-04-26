import { useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellContainer';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition.ts';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext.ts';
import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState.ts';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId.ts';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId.ts';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState.ts';

export const RecordTableCell = ({
  customHotkeyScope,
}: {
  customHotkeyScope: HotkeyScope;
}) => {
  const { onUpsertRecord, onMoveFocus, onCloseTableCell } =
    useContext(RecordTableContext);
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const { isReadOnly } = useContext(RecordTableRowContext);
  const [reference, setReference] = useState<HTMLDivElement | undefined>();

  const handleEnter: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
    onMoveFocus('down');
  };

  const handleSubmit: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
  };

  const handleCancel = () => {
    onCloseTableCell();
  };

  const handleClickOutside: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
  };

  const handleEscape: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
  };

  const handleTab: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
    onMoveFocus('right');
  };

  const handleShiftTab: FieldInputEvent = (persistField) => {
    onUpsertRecord({
      persistField,
      entityId,
      fieldName: fieldDefinition.metadata.fieldName,
    });

    onCloseTableCell();
    onMoveFocus('left');
  };

  const cellPosition = useCurrentTableCellPosition();

  const tableScopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(),
  );

  const isSoftFocusOnTableCellFamilyState = extractComponentFamilyState(
    isSoftFocusOnTableCellComponentFamilyState,
    tableScopeId,
  );

  const hasSoftFocus = useRecoilValue(
    isSoftFocusOnTableCellFamilyState(cellPosition),
  );

  return (
    <RecordTableCellContainer
      setReference={setReference}
      editHotkeyScope={customHotkeyScope}
      editModeContent={
        <FieldInput
          recordFieldInputdId={`${entityId}-${fieldDefinition?.metadata?.fieldName}`}
          onCancel={handleCancel}
          onClickOutside={handleClickOutside}
          onEnter={handleEnter}
          onEscape={handleEscape}
          onShiftTab={handleShiftTab}
          onSubmit={handleSubmit}
          onTab={handleTab}
          isReadOnly={isReadOnly}
        />
      }
      nonEditModeContent={
        <FieldDisplay isHovered={hasSoftFocus} reference={reference} />
      }
    />
  );
};
