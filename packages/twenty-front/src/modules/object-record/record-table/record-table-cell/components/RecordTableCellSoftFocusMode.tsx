import { PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconArrowUpRight } from 'twenty-ui';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useClearField } from '@/object-record/record-field/hooks/useClearField';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldClearable } from '@/object-record/record-field/hooks/useIsFieldClearable';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useToggleEditOnlyInput } from '@/object-record/record-field/hooks/useToggleEditOnlyInput';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButton';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { isSoftFocusUsingMouseState } from '@/object-record/record-table/states/isSoftFocusUsingMouseState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

type RecordTableCellSoftFocusModeProps = PropsWithChildren<unknown>;

export const RecordTableCellSoftFocusMode = ({
  children,
}: RecordTableCellSoftFocusModeProps) => {
  const { columnIndex } = useContext(RecordTableCellContext);
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { isFieldInputOnly } = useContext(FieldContext);

  const isFieldClearable = useIsFieldClearable();

  const toggleEditOnlyInput = useToggleEditOnlyInput();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSoftFocusUsingMouse = useRecoilValue(isSoftFocusUsingMouseState);
  const clearField = useClearField();

  useEffect(() => {
    if (!isSoftFocusUsingMouse) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSoftFocusUsingMouse]);

  useScopedHotkeys(
    [Key.Backspace, Key.Delete],
    () => {
      if (!isFieldInputOnly && isFieldClearable) {
        clearField();
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [clearField, isFieldClearable, isFieldInputOnly],
    {
      enabled: !isFieldInputOnly,
    },
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (!isFieldInputOnly) {
        openTableCell();
      } else {
        toggleEditOnlyInput();
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [openTableCell],
  );

  useScopedHotkeys(
    '*',
    (keyboardEvent) => {
      if (!isFieldInputOnly) {
        const isWritingText =
          !isNonTextWritingKey(keyboardEvent.key) &&
          !keyboardEvent.ctrlKey &&
          !keyboardEvent.metaKey;

        if (!isWritingText) {
          return;
        }

        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        keyboardEvent.stopImmediatePropagation();

        openTableCell(keyboardEvent.key);
      }
    },
    TableHotkeyScope.TableSoftFocus,
    [openTableCell],
    {
      preventDefault: false,
    },
  );

  const handleClick = () => {
    if (!isFieldInputOnly) {
      openTableCell();
    }
  };

  const cellPosition = useCurrentTableCellPosition();

  const isEmpty = useIsFieldEmpty();

  const isFirstColumn = columnIndex === 0;
  const customButtonIcon = useGetButtonIcon();
  const buttonIcon = isFirstColumn ? IconArrowUpRight : customButtonIcon;
  const { onMoveSoftFocusToCell } = useContext(RecordTableContext);
  const { isReadOnly } = useContext(RecordTableRowContext);

  const handleButtonClick = () => {
    onMoveSoftFocusToCell(cellPosition);
    openTableCell();
  };

  return (
    <>
      {!!buttonIcon &&
        !isFieldInputOnly &&
        (!isFirstColumn || !isEmpty) &&
        !isReadOnly && (
          <RecordTableCellButton
            onClick={handleButtonClick}
            Icon={buttonIcon}
          />
        )}
      <RecordTableCellDisplayContainer
        onClick={handleClick}
        softFocus
        scrollRef={scrollRef}
      >
        {children}
      </RecordTableCellDisplayContainer>
    </>
  );
};
