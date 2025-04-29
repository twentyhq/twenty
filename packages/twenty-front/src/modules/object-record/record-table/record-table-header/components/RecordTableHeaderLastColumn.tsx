import styled from '@emotion/styled';

import { HIDDEN_TABLE_COLUMN_DROPDOWN_ID } from '@/object-record/record-table/constants/HiddenTableColumnDropdownId';
import { RecordTableHeaderPlusButtonContent } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderPlusButtonContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useTheme } from '@emotion/react';
import { IconPlus } from 'twenty-ui/display';

const StyledPlusIconHeaderCell = styled.th<{
  isTableWiderThanScreen: boolean;
}>`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
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
`;

const StyledPlusIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
`;

const StyledDropdownContainer = styled.div`
  width: 32px;
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
  cursor: pointer;
`;

const HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID =
  'hidden-table-columns-dropdown-hotkey-scope-id';

export const RecordTableHeaderLastColumn = () => {
  const theme = useTheme();

  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const isTableWiderThanScreen =
    (scrollWrapperHTMLElement?.clientWidth ?? 0) <
    (scrollWrapperHTMLElement?.scrollWidth ?? 0);

  return (
    <StyledPlusIconHeaderCell isTableWiderThanScreen={isTableWiderThanScreen}>
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
          dropdownHotkeyScope={{
            scope: HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID,
          }}
        />
      </StyledDropdownContainer>
    </StyledPlusIconHeaderCell>
  );
};
