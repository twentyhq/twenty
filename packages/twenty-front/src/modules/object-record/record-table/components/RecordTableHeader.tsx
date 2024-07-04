import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui';

import { RecordTableHeaderCell } from '@/object-record/record-table/components/RecordTableHeaderCell';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useScrollWrapperScopedRef } from '@/ui/utilities/scroll/hooks/useScrollWrapperScopedRef';

import { RecordTableHeaderPlusButtonContent } from './RecordTableHeaderPlusButtonContent';
import { SelectAllCheckbox } from './SelectAllCheckbox';

const StyledTableHead = styled.thead<{ isFrozen: boolean }>`
  th {
    border-block: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.tertiary};
    padding: 0;
    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-top-color: transparent;
      border-bottom-color: transparent;
    }
  }

  th {
    background-color: ${({ theme }) => theme.background.primary};
    border-right: 1px solid ${({ theme }) => theme.border.color.light};
  }

  th {
    position: ${({ isFrozen }) => (isFrozen ? 'sticky' : 'static')};
    top: 0;
  }

  th:nth-of-type(1),
  th:nth-of-type(2),
  th:nth-of-type(3) {
    z-index: 12;
    background-color: ${({ theme }) => theme.background.primary};
  }

  th:nth-of-type(1) {
    width: 9px;
    left: 0;
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  th:nth-of-type(2) {
    left: 9px;
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  th:nth-of-type(3) {
    left: 39px;
  }

  th {
    z-index: ${({ isFrozen }) => (!isFrozen ? 0 : 9)};
  }
  cursor: pointer;
`;

const StyledPlusIconHeaderCell = styled.th<{ isTableWiderThanScreen: boolean }>`
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
    isTableWiderThanScreen &&
    `
    width: 32px;
    border-right: none !important;
    background-color: ${theme.background.primary};
    `};
  z-index: 1;
`;

const StyledPlusIconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

export const HIDDEN_TABLE_COLUMN_DROPDOWN_ID =
  'hidden-table-columns-dropdown-scope-id';

const HIDDEN_TABLE_COLUMN_DROPDOWN_HOTKEY_SCOPE_ID =
  'hidden-table-columns-dropdown-hotkey-scope-id';

export const RecordTableHeader = ({
  createRecord,
  isFrozen = false,
}: {
  createRecord: () => void;
  isFrozen?: boolean;
}) => {
  const { visibleTableColumnsSelector, hiddenTableColumnsSelector } =
    useRecordTableStates();

  const scrollWrapper = useScrollWrapperScopedRef();
  const isTableWiderThanScreen =
    (scrollWrapper.current?.clientWidth ?? 0) <
    (scrollWrapper.current?.scrollWidth ?? 0);

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());
  const hiddenTableColumns = useRecoilValue(hiddenTableColumnsSelector());

  const theme = useTheme();

  return (
    <StyledTableHead data-select-disable isFrozen={isFrozen}>
      <tr>
        <th></th>
        <th
          style={{
            width: 30,
            minWidth: 30,
            maxWidth: 30,
            borderRight: 'transparent',
          }}
        >
          <SelectAllCheckbox />
        </th>
        {visibleTableColumns.map((column) => (
          <RecordTableHeaderCell
            key={column.fieldMetadataId}
            column={column}
            createRecord={createRecord}
          />
        ))}
        <StyledPlusIconHeaderCell
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
      </tr>
    </StyledTableHead>
  );
};
