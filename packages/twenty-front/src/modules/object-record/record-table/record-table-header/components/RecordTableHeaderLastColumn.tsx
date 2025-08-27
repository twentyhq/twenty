import styled from '@emotion/styled';

import { HIDDEN_TABLE_COLUMN_DROPDOWN_ID } from '@/object-record/record-table/constants/HiddenTableColumnDropdownId';
import { RecordTableHeaderPlusButtonContent } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderPlusButtonContent';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useTheme } from '@emotion/react';
import { IconPlus } from 'twenty-ui/display';

const StyledPlusIconHeaderCell = styled.th<{
  isTableWiderThanScreen: boolean;
  isFirstRowActiveOrFocused: boolean;
}>`
  border-bottom: ${({ isFirstRowActiveOrFocused, theme }) =>
    isFirstRowActiveOrFocused
      ? 'none'
      : `1px solid ${theme.border.color.light}`};
  background-color: ${({ theme }) => theme.background.primary};
  border-left: none !important;
  color: ${({ theme }) => theme.font.color.tertiary};
  border-right: none !important;
  cursor: default;

  ${({ isTableWiderThanScreen, theme }) =>
    isTableWiderThanScreen
      ? `
    background-color: ${theme.background.primary};
    width: 32px;
    `
      : 'width: 100%'};
  z-index: 1;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.secondary};
  }
`;

const StyledPlusIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: flex-start;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledDropdownContainer = styled.div`
  cursor: pointer;
`;

export const RecordTableHeaderLastColumn = () => {
  const theme = useTheme();

  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const isTableWiderThanScreen =
    (scrollWrapperHTMLElement?.clientWidth ?? 0) <
    (scrollWrapperHTMLElement?.scrollWidth ?? 0);

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
      isTableWiderThanScreen={isTableWiderThanScreen}
      isFirstRowActiveOrFocused={isFirstRowActiveOrFocused}
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
