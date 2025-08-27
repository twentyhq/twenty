import styled from '@emotion/styled';

import { type ImportedRow } from '@/spreadsheet-import/types';

import { type SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledExample = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type UserTableColumnProps = {
  column: SpreadsheetColumn;
  importedRow: ImportedRow;
};

export const UserTableColumn = ({
  column,
  importedRow,
}: UserTableColumnProps) => {
  const { header } = column;
  const firstDefinedValue = importedRow.find(isDefined);

  return (
    <StyledContainer>
      <StyledValue>{header}</StyledValue>
      {firstDefinedValue && (
        <StyledExample>{`ex: ${firstDefinedValue}`}</StyledExample>
      )}
    </StyledContainer>
  );
};
