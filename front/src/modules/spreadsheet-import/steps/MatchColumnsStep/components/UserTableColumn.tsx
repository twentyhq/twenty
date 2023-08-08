import styled from '@emotion/styled';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconArrowBack, IconX } from '@/ui/icon';

import type { RawData } from '../../../types';
import type { Column } from '../MatchColumnsStep';
import { ColumnType } from '../MatchColumnsStep';

const Container = styled.div``;

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

const Heading = styled.h2<IsIgnoreProps>`
  color: ${({ theme, isIgnored }) => {
    if (isIgnored) {
      return theme.font.color.secondary;
    }
    return theme.font.color.primary;
  }};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Text = styled.span<IsIgnoreProps>`
  color: ${({ theme, isIgnored }) => {
    if (isIgnored) {
      return theme.font.color.secondary;
    }
    return theme.font.color.primary;
  }};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type UserTableColumnProps<T extends string> = {
  column: Column<T>;
  entries: RawData;
  onIgnore: (index: number) => void;
  onRevertIgnore: (index: number) => void;
};

export const UserTableColumn = <T extends string>({
  column: { header, index, type },
  entries,
  onIgnore,
  onRevertIgnore,
}: UserTableColumnProps<T>) => {
  const isIgnored = type === ColumnType.ignored;

  return (
    <Container>
      <Content>
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
      </Content>
      {entries.map((entry, index) => (
        <Text key={(entry || '') + index} isIgnored={isIgnored}>
          {entry}
        </Text>
      ))}
    </Container>
  );
};
