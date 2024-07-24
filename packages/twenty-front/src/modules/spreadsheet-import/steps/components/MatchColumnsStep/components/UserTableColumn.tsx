import styled from '@emotion/styled';

import { ImportedRow } from '@/spreadsheet-import/types';
import { isDefined } from '~/utils/isDefined';

import { Column } from '../MatchColumnsStep';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
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

type UserTableColumnProps<T extends string> = {
  column: Column<T>;
  importedRow: ImportedRow;
};

export const UserTableColumn = <T extends string>({
  column,
  importedRow,
}: UserTableColumnProps<T>) => {
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
