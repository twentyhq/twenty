import styled from '@emotion/styled';

import { HIDDEN_TABLE_COLUMN_DROPDOWN_ID } from '@/object-record/record-table/constants/HiddenTableColumnDropdownId';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { RecordTableHeaderPlusButtonContent } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderPlusButtonContent';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useTheme } from '@emotion/react';
import { cx } from '@linaria/core';
import { IconPlus } from 'twenty-ui/display';

const StyledPlusIconHeaderCell = styled.div<{
  isFirstRowActiveOrFocused: boolean;
}>`
  border-bottom: ${({ isFirstRowActiveOrFocused, theme }) =>
    isFirstRowActiveOrFocused
      ? 'none'
      : `1px solid ${theme.border.color.light}`};
  background-color: ${({ theme }) => theme.background.primary};

  color: ${({ theme }) => theme.font.color.tertiary};
  border-right: ${({ theme }) => theme.border.color.light} !important;

  cursor: default;

  width: 32px;

  z-index: 1;

  height: 32px;
  max-height: 32px;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.secondary};
  }
`;

const StyledPlusIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  width: 100%;
  justify-content: center;
`;

const StyledDropdownContainer = styled.div`
  cursor: pointer;
  width: 100%;
`;

export const RecordTableHeaderAddColumnButton = () => {
  const theme = useTheme();

  const isFirstRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    0,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    0,
  );

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  return (
    <StyledPlusIconHeaderCell
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
      className={cx(
        'header-cell',
        RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME,
      )}
    >
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
