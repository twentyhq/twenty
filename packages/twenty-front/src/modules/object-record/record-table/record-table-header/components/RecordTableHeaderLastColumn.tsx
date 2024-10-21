import { Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { IconPlus, ThemeContext } from 'twenty-ui';

import { HIDDEN_TABLE_COLUMN_DROPDOWN_ID } from '@/object-record/record-table/constants/HiddenTableColumnDropdownId';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableHeaderPlusButtonContent } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderPlusButtonContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useScrollWrapperScopedRef } from '@/ui/utilities/scroll/hooks/useScrollWrapperScopedRef';

const StyledPlusIconHeaderCell = styled.th<{
  theme: Theme;
  isTableWiderThanScreen: boolean;
}>`
  ${({ theme }) => {
    return `
  &:hover {
    background: ${theme.background.transparent.light};
  };
  `;
  }};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  background-color: ${({ theme }) => theme.background.primary};
  border-left: none !important;
  color: ${({ theme }) => theme.font.color.tertiary};
  min-width: 32px;
  width: 32px;
  border-right: none !important;

  ${({ isTableWiderThanScreen, theme }) =>
    isTableWiderThanScreen
      ? `
    background-color: ${theme.background.primary};
    `
      : ''};
  z-index: 1;
`;

const StyledPlusIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 100%;
`;

const HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID =
  'hidden-table-columns-dropdown-hotkey-scope-id';

export const RecordTableHeaderLastColumn = () => {
  const { theme } = useContext(ThemeContext);

  const scrollWrapper = useScrollWrapperScopedRef('recordTableWithWrappers');

  const isTableWiderThanScreen =
    (scrollWrapper.ref.current?.clientWidth ?? 0) <
    (scrollWrapper.ref.current?.scrollWidth ?? 0);

  const { hiddenTableColumnsSelector } = useRecordTableStates();

  const hiddenTableColumns = useRecoilValue(hiddenTableColumnsSelector());

  return (
    <StyledPlusIconHeaderCell
      theme={theme}
      isTableWiderThanScreen={isTableWiderThanScreen}
    >
      {hiddenTableColumns.length > 0 && (
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
      )}
    </StyledPlusIconHeaderCell>
  );
};
