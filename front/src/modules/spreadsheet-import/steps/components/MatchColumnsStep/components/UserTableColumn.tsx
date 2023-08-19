import styled from '@emotion/styled';

import type { RawData } from '@/spreadsheet-import/types';
import { assertNotNull } from '~/utils/assert';

import type { Column } from '../MatchColumnsStep';

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
  entries: RawData;
};

export const UserTableColumn = <T extends string>({
  column,
  entries,
}: UserTableColumnProps<T>) => {
  const { header } = column;
  const entry = entries.find(assertNotNull);

  return (
    <StyledContainer>
      <StyledValue>{header}</StyledValue>
      {entry && <StyledExample>{`ex: ${entry}`}</StyledExample>}
    </StyledContainer>
  );
};
