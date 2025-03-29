import { ReactElement, useContext, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { IconArrowUpRight } from 'twenty-ui';

import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { isSoftFocusUsingMouseState } from '@/object-record/record-table/states/isSoftFocusUsingMouseState';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { isDefined } from 'twenty-shared/utils';
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
  const { recordId, isReadOnly } = useContext(FieldContext);

  const { onActionMenuDropdownOpened } = useRecordTableBodyContextOrThrow();

  const { openTableCell } = useOpenRecordTableCellFromCell();

  const editModeContentOnly = useIsFieldInputOnly();

  const isFieldInputOnly = useIsFieldInputOnly();

  const isEmpty = useIsFieldEmpty();

  const scrollRef = useRef<HTMLDivElement>(null);

  const isSoftFocusUsingMouse = useRecoilValue(isSoftFocusUsingMouseState);

  useEffect(() => {
    if (!isSoftFocusUsingMouse) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSoftFocusUsingMouse]);

  const handleClick = () => {
    if (!isFieldInputOnly && !isReadOnly) {
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
    isDefined(buttonIcon) && !editModeContentOnly && !isReadOnly;

  const dontShowContent = isEmpty && isReadOnly;

  const showPlaceholder =
    !editModeContentOnly && !isReadOnly && isFirstColumn && isEmpty;

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
