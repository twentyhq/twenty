import styled from '@emotion/styled';

import { assertNotNull } from '~/utils/assert';

import type { RawData } from '../../../types';
import type { Column } from '../MatchColumnsStep';
import { ColumnType } from '../MatchColumnsStep';

const Container = styled.div`
  display: flex;
  flex-direction: column;
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

const Content = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

type IsIgnoreProps = {
  isIgnored: boolean;
};

type UserTableColumnProps<T extends string> = {
  column: Column<T>;
  entries: RawData;
  onIgnore: (index: number) => void;
  onRevertIgnore: (index: number) => void;
};

export const UserTableColumn = <T extends string>({
  column,
  entries,
  onIgnore,
  onRevertIgnore,
}: UserTableColumnProps<T>) => {
  const { header, index, type } = column;
  const isIgnored = type === ColumnType.ignored;
  const entry = entries.find(assertNotNull);

  console.log('column: ', column);

  return (
    <Container>
      <Value>{header}</Value>
      {entry && <Example>{`ex: ${entry}`}</Example>}
      {/* <Content>
        <Heading isIgnored={isIgnored}>{header}</Heading>
        {type === ColumnType.ignored ? (
          <IconButton
            aria-label="Ignore column"
            icon={<IconArrowBack />}
            onClick={() => onRevertIgnore(index)}
          />
        ) : (
          <IconButton
            aria-label="Ignore column"
            icon={<IconX />}
            onClick={() => onIgnore(index)}
          />
        )}
      </Content> */}
    </Container>
  );
};
