import styled from '@emotion/styled';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { HIDDEN_TABLE_COLUMN_DROPDOWN_ID } from '@/object-record/record-table/constants/HiddenTableColumnDropdownId';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderPlusButtonContent } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderPlusButtonContent';
import { RecordTableHeaderResizeHandler } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderResizeHandler';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import { cx } from '@linaria/core';
import { IconPlus } from 'twenty-ui/display';

const StyledPlusIconHeaderCell = styled.div<{
  shouldDisplayBorderBottom: boolean;
}>`
  border-bottom: ${({ theme, shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${theme.border.color.light}`
      : 'none'};
  background-color: ${({ theme }) => theme.background.primary};

  color: ${({ theme }) => theme.font.color.tertiary};
  border-right: ${({ theme }) => theme.border.color.light} !important;

  cursor: pointer;

  width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;

  z-index: 1;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  max-height: ${RECORD_TABLE_ROW_HEIGHT}px;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
  }
`;

const StyledPlusIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  width: 100%;
  justify-content: center;
`;

const StyledDropdownContainer = styled.div`
  cursor: pointer;
  width: 100%;
`;

export const RecordTableHeaderAddColumnButton = () => {
  const theme = useTheme();

  const isFirstRowActive = useRecoilComponentFamilyValueV2(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValueV2(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isRowFocusActive = useRecoilComponentValueV2(
    isRecordTableRowFocusActiveComponentState,
  );

  const isFirstRowActiveOrFocused =
    isFirstRowActive || (isFirstRowFocused && isRowFocusActive);

  const isScrolledVertically = useRecoilComponentValueV2(
    isRecordTableScrolledVerticallyComponentState,
  );

  const hasRecordGroups = useRecoilComponentSelectorValueV2(
    hasRecordGroupsComponentSelector,
  );

  const shouldDisplayBorderBottom =
    hasRecordGroups || !isFirstRowActiveOrFocused || isScrolledVertically;

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return (
    <StyledPlusIconHeaderCell
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
      className={cx(
        'header-cell',
        RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME,
      )}
    >
      <RecordTableHeaderResizeHandler
        recordFieldIndex={visibleRecordFields.length}
        position="left"
      />
      <StyledDropdownContainer>
        <Dropdown
          dropdownId={HIDDEN_TABLE_COLUMN_DROPDOWN_ID}
          clickableComponent={
            <StyledPlusIconContainer>
              <IconPlus size={theme.icon.size.md} />
            </StyledPlusIconContainer>
          }
          dropdownComponents={<RecordTableHeaderPlusButtonContent />}
          dropdownPlacement="bottom-start"
        />
      </StyledDropdownContainer>
    </StyledPlusIconHeaderCell>
  );
};
