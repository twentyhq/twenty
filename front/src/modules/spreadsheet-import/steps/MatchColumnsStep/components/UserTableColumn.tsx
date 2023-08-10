import styled from '@emotion/styled';

import { assertNotNull } from '~/utils/assert';

import type { RawData } from '../../../types';
import type { Column } from '../MatchColumnsStep';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Value = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Example = styled.span`
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
    <Container>
      <Value>{header}</Value>
      {entry && <Example>{`ex: ${entry}`}</Example>}
    </Container>
  );
};
