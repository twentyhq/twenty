import type React from 'react';
import styled from '@emotion/styled';

import { Modal } from '@/ui/modal/components/Modal';

import { ContinueButton } from '../../../components/ContinueButton';
import { FadingWrapper } from '../../../components/FadingWrapper';
import type { Column, Columns } from '../MatchColumnsStep';

const Content = styled(Modal.Content)`
  align-items: center;
`;

const Heading = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Description = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const MatchTable = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  height: 0px;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const MatchTableColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

type MatchTableHeaderProps = {
  position: 'left' | 'right';
};

const MatchTableHeader = styled.div<MatchTableHeaderProps>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  text-transform: uppercase;
  ${({ position, theme }) => {
    if (position === 'left') {
      return `border-top-left-radius: calc(${theme.border.radius.md} - 1px);`;
    }
    return `border-top-right-radius: calc(${theme.border.radius.md} - 1px);`;
  }};
`;

const Title = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

type ColumnLengthProps = {
  columnLength: number;
};

const Grid = styled.div<ColumnLengthProps>`
  display: grid;
  flex: 1;
  grid-template-columns:
    0.75rem repeat(${({ columnLength }) => columnLength}, minmax(18rem, auto))
    0.75rem;
  grid-template-rows: auto auto auto 1fr;
  height: 100%;
`;

type GridProps = {
  gridRow?: string;
  gridColumn?: string;
};

const Box = styled.div<GridProps>`
  ${({ gridColumn }) => {
    if (!gridColumn) {
      return;
    }

    return `
      grid-column: ${gridColumn};
    `;
  }};
  ${({ gridRow }) => {
    if (!gridRow) {
      return;
    }

    return `
      grid-row: ${gridRow};
    `;
  }};
`;

const UserColumn = styled(Box)`
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const TemplateTitle = styled(Box)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const TemplateColumn = styled(Box)`
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

type ColumnGridProps<T extends string> = {
  columns: Columns<T>;
  userColumn: (column: Column<T>) => React.ReactNode;
  templateColumn: (column: Column<T>) => React.ReactNode;
  onContinue: (val: Record<string, string>[]) => void;
  isLoading: boolean;
};

export const ColumnGrid = <T extends string>({
  columns,
  userColumn,
  templateColumn,
  onContinue,
  isLoading,
}: ColumnGridProps<T>) => {
  return (
    <>
      <Content>
        <Heading>Match Columns</Heading>
        <Description>
          Select the correct field for each column you'd like to import.
        </Description>
        <MatchTable>
          <MatchTableColumn>
            <MatchTableHeader position="left">Imported data</MatchTableHeader>
          </MatchTableColumn>
          <MatchTableColumn>
            <MatchTableHeader position="right">Twenty fields</MatchTableHeader>
          </MatchTableColumn>
        </MatchTable>
        <Grid columnLength={columns.length}>
          <Box gridColumn={`1/${columns.length + 3}`}>
            <Title>Your table</Title>
          </Box>
          {columns.map((column, index) => (
            <UserColumn
              key={column.header + index}
              gridRow="2/3"
              gridColumn={`${index + 2}/${index + 3}`}
            >
              {userColumn(column)}
            </UserColumn>
          ))}
          <FadingWrapper gridColumn={`1/${columns.length + 3}`} gridRow="2/3" />
          <TemplateTitle gridColumn={`1/${columns.length + 3}`}>
            <Title>Will become</Title>
          </TemplateTitle>
          <FadingWrapper gridColumn={`1/${columns.length + 3}`} gridRow="4/5" />
          {columns.map((column, index) => (
            <TemplateColumn
              key={column.header + index}
              gridRow="4/5"
              gridColumn={`${index + 2}/${index + 3}`}
            >
              {templateColumn(column)}
            </TemplateColumn>
          ))}
        </Grid>
      </Content>
      <ContinueButton
        isLoading={isLoading}
        onContinue={onContinue}
        title="Next"
      />
    </>
  );
};
