import { OnDemandJsonFieldViewer } from '@/object-record/record-field/on-demand/components/OnDemandJsonFieldViewer';
import { useOnDemandFieldDisplay } from '@/object-record/record-field/on-demand/hooks/useOnDemandFieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { useIsFieldClearable } from '@/object-record/record-field/ui/hooks/useIsFieldClearable';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useRecordTableSelectAllHotkeys } from '@/object-record/record-table/hooks/useRecordTableSelectAllHotkeys';
import { useListenToSidePanelOpening } from '@/ui/layout/side-panel/hooks/useListenToSidePanelOpening';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { useCallback, useContext, useRef } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

const StyledAnchor = styled.span`
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

type RecordTableCellOnDemandFieldDisplayProps = {
  cellFocusId: string;
};

export const RecordTableCellOnDemandFieldDisplay = ({
  cellFocusId,
}: RecordTableCellOnDemandFieldDisplayProps) => {
  const { isForbidden, isRecordFieldReadOnly, onOpenEditMode } =
    useContext(FieldContext);
  const { onCloseTableCell } = useRecordTableBodyContextOrThrow();
  const store = useStore();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const { loadStatus, openOnDemandField, closeOnDemandField } =
    useOnDemandFieldDisplay();
  const { restoreRecordTableRowFocusFromCellPosition } =
    useFocusedRecordTableRow();
  const clearField = useClearField();
  const isFieldClearable = useIsFieldClearable();

  const setAnchorElement = useCallback(
    (element: HTMLSpanElement | null) => {
      anchorRef.current = element;
      if (!isDefined(element) || isRecordFieldReadOnly || isForbidden) {
        closeOnDemandField();
      }
    },
    [closeOnDemandField, isRecordFieldReadOnly, isForbidden],
  );

  const handleOpen = async () => {
    if (loadStatus === 'loading') {
      return;
    }
    const loadedField = await openOnDemandField();
    if (
      isDefined(loadedField) &&
      !loadedField.isReadOnly &&
      isDefined(onOpenEditMode)
    ) {
      closeOnDemandField();
      onOpenEditMode();
    }
  };

  const handleClear = async () => {
    if (
      isRecordFieldReadOnly ||
      !isFieldClearable ||
      loadStatus === 'loading'
    ) {
      return;
    }
    const loadedField = await openOnDemandField();
    if (!isDefined(loadedField)) {
      return;
    }
    closeOnDemandField();
    if (
      loadedField.isReadOnly ||
      store.get(currentFocusIdSelector.atom) !== cellFocusId
    ) {
      return;
    }
    clearField();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Enter, 'space'],
    focusId: cellFocusId,
    callback: () => void handleOpen(),
    dependencies: [handleOpen],
    options: {
      ignoreEventWhen: () => isForbidden ?? false,
    },
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Backspace, Key.Delete],
    focusId: cellFocusId,
    callback: () => void handleClear(),
    dependencies: [handleClear],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    focusId: cellFocusId,
    callback: () => {
      if (loadStatus !== 'closed') {
        closeOnDemandField();
        return;
      }

      restoreRecordTableRowFocusFromCellPosition();
    },
    dependencies: [
      closeOnDemandField,
      loadStatus,
      restoreRecordTableRowFocusFromCellPosition,
    ],
  });

  useRecordTableSelectAllHotkeys({ focusId: cellFocusId });
  const handleSidePanelOpening = useCallback(() => {
    closeOnDemandField();
    onCloseTableCell();
  }, [closeOnDemandField, onCloseTableCell]);

  useListenToSidePanelOpening(handleSidePanelOpening);

  if (isForbidden) {
    return null;
  }

  return (
    <>
      <StyledAnchor ref={setAnchorElement} />
      {loadStatus !== 'closed' && (
        <OnDemandJsonFieldViewer
          anchorElement={anchorRef.current ?? undefined}
          loadStatus={loadStatus}
          onClose={closeOnDemandField}
          onRetry={() => void handleOpen()}
        />
      )}
    </>
  );
};
