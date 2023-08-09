import React from 'react';
import styled from '@emotion/styled';

import { Modal } from '@/ui/modal/components/Modal';

import { ContinueButton } from '../../../components/ContinueButton';
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

const TableContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0px;
  width: 100%;
`;

const MatchTable = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 75%;
`;

const MatchTableColumn = styled.div`
  display: flex;
  flex: 0 0 50%;
  flex-direction: column;
  overflow-x: auto;
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
  ${({ position, theme }) => {
    if (position === 'left') {
      return `border-top-left-radius: calc(${theme.border.radius.md} - 1px);`;
    }
    return `border-top-right-radius: calc(${theme.border.radius.md} - 1px);`;
  }};
  text-transform: uppercase;
`;

const MatchTableRow = styled.div<MatchTableHeaderProps>`
  align-items: center;
  display: flex;
  height: 64px;
  ${({ position, theme }) => {
    if (position === 'left') {
      return `
        padding-left: ${theme.spacing(4)};
        padding-right: ${theme.spacing(2)};
      `;
    }
    return `
      padding-left: ${theme.spacing(2)};
      padding-right: ${theme.spacing(4)};
    `;
  }};
`;

type ColumnGridProps<T extends string> = {
  columns: Columns<T>;
  renderUserColumn: (column: Column<T>) => React.ReactNode;
  renderTemplateColumn: (column: Column<T>) => React.ReactNode;
  onContinue: (val: Record<string, string>[]) => void;
  isLoading: boolean;
};

export const ColumnGrid = <T extends string>({
  columns,
  renderUserColumn,
  renderTemplateColumn,
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
        <TableContainer>
          <MatchTable>
            <MatchTableColumn>
              <MatchTableHeader position="left">Imported data</MatchTableHeader>
              {columns.map((column, index) => {
                const userColumn = renderUserColumn(column);

                if (React.isValidElement(userColumn)) {
                  return (
                    <MatchTableRow key={index} position="left">
                      {userColumn}
                    </MatchTableRow>
                  );
                }

                return null;
              })}
            </MatchTableColumn>
            <MatchTableColumn>
              <MatchTableHeader position="right">
                Twenty fields
              </MatchTableHeader>
              {columns.map((column, index) => {
                const templateColumn = renderTemplateColumn(column);

                if (React.isValidElement(templateColumn)) {
                  return (
                    <MatchTableRow key={index} position="right">
                      {templateColumn}
                    </MatchTableRow>
                  );
                }

                return null;
              })}
            </MatchTableColumn>
          </MatchTable>
        </TableContainer>
      </Content>
      <ContinueButton
        isLoading={isLoading}
        onContinue={onContinue}
        title="Next"
      />
    </>
  );
};
