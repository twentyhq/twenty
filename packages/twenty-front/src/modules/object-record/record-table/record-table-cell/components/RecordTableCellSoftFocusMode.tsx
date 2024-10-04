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
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useCloseCurrentTableCellInEditMode } from '@/object-record/record-table/hooks/internal/useCloseCurrentTableCellInEditMode';
import { RecordTableCellButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { isSoftFocusUsingMouseState } from '@/object-record/record-table/states/isSoftFocusUsingMouseState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { useIsFieldReadOnly } from '@/object-record/record-field/hooks/useIsFieldReadOnly';
import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

type RecordTableCellSoftFocusModeProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
};

export const RecordTableCellSoftFocusMode = ({
  editModeContent,
  nonEditModeContent,
}: RecordTableCellSoftFocusModeProps) => {
  const { columnIndex } = useContext(RecordTableCellContext);
  const closeCurrentTableCell = useCloseCurrentTableCellInEditMode();
  const { isReadOnly: isRowReadOnly } = useContext(RecordTableRowContext);

  const isFieldReadOnly = useIsFieldReadOnly();

  const isCellReadOnly = isFieldReadOnly || isRowReadOnly;

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
      if (isCellReadOnly) {
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
      if (isCellReadOnly) {
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
    if (!isFieldInputOnly && !isCellReadOnly) {
      openTableCell();
    }
  };

  const handleButtonClick = () => {
    handleClick();
    /*
    Disabling sidepanel access for now, TODO: launch
    if (!isFieldInputOnly) {
      openTableCell(undefined, true);
    }
    */
  };

  useListenClickOutside({
    refs: [scrollRef],
    callback: () => {
      closeCurrentTableCell();
    },
  });

  const isFirstColumn = columnIndex === 0;
  const customButtonIcon = useGetButtonIcon();
  const buttonIcon = isFirstColumn
    ? IconArrowUpRight // IconLayoutSidebarRightExpand - Disabling sidepanel access for now
    : customButtonIcon;

  const showButton =
    isDefined(buttonIcon) &&
    !editModeContentOnly &&
    (!isFirstColumn || !isEmpty) &&
    !isCellReadOnly;

  const dontShowContent = isEmpty && isCellReadOnly;

  return (
    <>
      <RecordTableCellDisplayContainer
        onClick={handleClick}
        scrollRef={scrollRef}
        softFocus
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
