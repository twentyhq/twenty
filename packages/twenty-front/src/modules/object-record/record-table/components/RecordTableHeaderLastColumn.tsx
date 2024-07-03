import { useContext } from 'react';
import { Theme } from '@emotion/react';
import { styled } from '@linaria/react';
import { useRecoilValue } from 'recoil';
import { IconPlus, ThemeContext } from 'twenty-ui';

import { RecordTableHeaderPlusButtonContent } from '@/object-record/record-table/components/RecordTableHeaderPlusButtonContent';
import { HIDDEN_TABLE_COLUMN_DROPDOWN_ID } from '@/object-record/record-table/constants/HiddenTableColumnDropdownId';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
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
  padding-left: ${theme.spacing(3)};
  `;
  }};
  border-left: none !important;
  min-width: 32px;
  ${({ isTableWiderThanScreen, theme }) =>
    isTableWiderThanScreen
      ? `
    width: 32px;
    border-right: none !important;
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
  width: 32px;
`;

const HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID =
  'hidden-table-columns-dropdown-hotkey-scope-id';

export const RecordTableHeaderLastColumn = () => {
  const { theme } = useContext(ThemeContext);

  const scrollWrapper = useScrollWrapperScopedRef();

  const isTableWiderThanScreen =
    (scrollWrapper.current?.clientWidth ?? 0) <
    (scrollWrapper.current?.scrollWidth ?? 0);

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
