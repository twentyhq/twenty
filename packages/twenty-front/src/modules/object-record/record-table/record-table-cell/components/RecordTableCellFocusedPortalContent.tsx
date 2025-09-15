import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';

import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import styled from '@emotion/styled';
import { BORDER_COMMON } from 'twenty-ui/theme';

const StyledRecordTableCellFocusPortalContent = styled.div<{
  isRowActive: boolean;
}>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  background-color: ${({ theme, isRowActive }) =>
    isRowActive ? theme.accent.quaternary : theme.background.primary};
  border-radius: ${BORDER_COMMON.radius.sm};
  box-sizing: border-box;
  display: flex;

  height: 32px;

  outline: ${({ theme }) => `1px solid ${theme.color.blue}`};

  user-select: none;
`;

export const RecordTableCellFocusedPortalContent = () => {
  const { rowIndex } = useRecordTableRowContextOrThrow();

  const isRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  return (
    <StyledRecordTableCellFocusPortalContent isRowActive={isRowActive}>
      <RecordTableCellDisplayMode>
        <FieldDisplay />
      </RecordTableCellDisplayMode>
    </StyledRecordTableCellFocusPortalContent>
  );
};
