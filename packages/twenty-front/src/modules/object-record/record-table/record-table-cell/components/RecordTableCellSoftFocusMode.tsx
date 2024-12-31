import { ReactElement, useContext, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconArrowUpRight } from 'twenty-ui';

import { useClearField } from '@/object-record/record-field/hooks/useClearField';
import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldClearable } from '@/object-record/record-field/hooks/useIsFieldClearable';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { useToggleEditOnlyInput } from '@/object-record/record-field/hooks/useToggleEditOnlyInput';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { isSoftFocusUsingMouseState } from '@/object-record/record-table/states/isSoftFocusUsingMouseState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { isDefined } from '~/utils/isDefined';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

type RecordTableCellSoftFocusModeProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
};

export const RecordTableCellSoftFocusMode = ({
  editModeContent,
  nonEditModeContent,
}: RecordTableCellSoftFocusModeProps) => {
  const { columnIndex, columnDefinition } = useContext(RecordTableCellContext);
  const { recordId } = useContext(FieldContext);

  const { onActionMenuDropdownOpened } = useRecordTableBodyContextOrThrow();

  const isFieldReadOnly = useIsFieldValueReadOnly();

  const { openTableCell } = useOpenRecordTableCellFromCell();

  const editModeContentOnly = useIsFieldInputOnly();

  const isFieldInputOnly = useIsFieldInputOnly();

  const isEmpty = useIsFieldEmpty();

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
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (isFieldReadOnly) {
        return;
      }

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
      if (isFieldReadOnly) {
        return;
      }

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
    if (!isFieldInputOnly && !isFieldReadOnly) {
      openTableCell();
    }
  };

  const handleButtonClick = () => {
    if (!isFieldInputOnly && isFirstColumn) {
      openTableCell(undefined, false, true);
    } else {
      openTableCell();
    }
    /*
    Disabling sidepanel access for now, TODO: launch
    if (!isFieldInputOnly) {
      openTableCell(undefined, true);
    }
    */
  };

  const handleActionMenuDropdown = (event: React.MouseEvent) => {
    onActionMenuDropdownOpened(event, recordId);
  };

  const isFirstColumn = columnIndex === 0;
  const customButtonIcon = useGetButtonIcon();
  const buttonIcon = isFirstColumn
    ? IconArrowUpRight // IconLayoutSidebarRightExpand - Disabling sidepanel access for now
    : customButtonIcon;

  const showButton =
    isDefined(buttonIcon) && !editModeContentOnly && !isFieldReadOnly;

  const dontShowContent = isEmpty && isFieldReadOnly;

  const showPlaceholder =
    !editModeContentOnly && !isFieldReadOnly && isFirstColumn && isEmpty;

  return (
    <>
      <RecordTableCellDisplayContainer
        onClick={handleClick}
        scrollRef={scrollRef}
        softFocus
        onContextMenu={handleActionMenuDropdown}
        placeholderForEmptyCell={
          showPlaceholder ? columnDefinition.label : undefined
        }
      >
        {dontShowContent ? (
          <></>
        ) : editModeContentOnly ? (
          editModeContent
        ) : (
          nonEditModeContent
        )}
      </RecordTableCellDisplayContainer>
      {showButton && (
        <RecordTableCellButton onClick={handleButtonClick} Icon={buttonIcon} />
      )}
    </>
  );
};
