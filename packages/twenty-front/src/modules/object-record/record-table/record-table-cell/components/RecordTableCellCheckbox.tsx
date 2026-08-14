import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { isDefined } from 'twenty-shared/utils';
import { Checkbox } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: calc(${RECORD_TABLE_ROW_HEIGHT}px * var(--t-scale, 1));
  justify-content: center;
  min-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH};
  padding-right: ${themeCssVariables.spacing[1]};
  width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH};
`;

export const RecordTableCellCheckbox = () => {
  const { t } = useLingui();

  const { isSelected } = useRecordTableRowContextOrThrow();
  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const handleClick = useCallback(
    (event?: React.MouseEvent<HTMLDivElement>) => {
      setCurrentRowSelected({
        newSelectedState: !isSelected,
        shouldSelectRange: isDefined(event?.shiftKey) && event.shiftKey,
      });
    },
    [isSelected, setCurrentRowSelected],
  );

  return (
    <RecordTableCellStyleWrapper
      isSelected={isSelected}
      isDragging={isDragging}
      hasRightBorder={false}
      widthClassName={RECORD_TABLE_COLUMN_CHECKBOX_WIDTH_CLASS_NAME}
    >
      <StyledContainer onClick={handleClick} data-select-disable>
        <Checkbox hoverable checked={isSelected} aria-label={t`Select row`} />
      </StyledContainer>
    </RecordTableCellStyleWrapper>
  );
};
