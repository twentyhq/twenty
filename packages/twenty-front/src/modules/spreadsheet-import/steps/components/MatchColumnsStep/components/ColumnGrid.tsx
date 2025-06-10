import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import styled from '@emotion/styled';
import React from 'react';

const StyledGridContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0px;
  width: 100%;
`;

const StyledGrid = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

type HeightProps = {
  height?: `${number}px`;
  withBorder?: boolean;
};

const StyledGridRow = styled.div<HeightProps>`
  border-bottom: ${({ withBorder, theme }) =>
    withBorder && `1px solid ${theme.border.color.medium}`};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  min-height: ${({ height = '64px' }) => height};
`;

type PositionProps = {
  position: 'left' | 'right' | 'full-line';
};

const StyledGridCell = styled.div<PositionProps>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  ${({ position, theme }) => {
    if (position === 'left') {
      return `
        padding-left: ${theme.spacing(4)};
        padding-right: ${theme.spacing(2)};
        padding-top:  ${theme.spacing(4)};
      `;
    }
    if (position === 'full-line') {
      return `
        padding-left: ${theme.spacing(2)};
        padding-right: ${theme.spacing(4)};
        padding-top:  ${theme.spacing(0)};
        width: 100%;
      `;
    }
    return `
      padding-left: ${theme.spacing(2)};
      padding-right: ${theme.spacing(4)};
      padding-top:  ${theme.spacing(4)};
    `;
  }};
`;

const StyledGridHeader = styled.div<PositionProps>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  ${({ position, theme }) => {
    if (position === 'left') {
      return `border-top-left-radius: calc(${theme.border.radius.md} - 1px);`;
    }
    return `border-top-right-radius: calc(${theme.border.radius.md} - 1px);`;
  }};
  text-transform: uppercase;
`;

type ColumnGridProps<T extends string> = {
  columns: SpreadsheetColumns<T>;
  renderUserColumn: (
    columns: SpreadsheetColumns<T>,
    columnIndex: number,
  ) => React.ReactNode;
  renderTemplateColumn: (
    columns: SpreadsheetColumns<T>,
    columnIndex: number,
  ) => React.ReactNode;
  renderUnmatchedColumn: (
    columns: SpreadsheetColumns<T>,
    columnIndex: number,
  ) => React.ReactNode;
};

export const ColumnGrid = <T extends string>({
  columns,
  renderUserColumn,
  renderTemplateColumn,
  renderUnmatchedColumn,
}: ColumnGridProps<T>) => {
  return (
    <>
      <StyledGridContainer>
        <StyledGrid>
          <StyledGridRow height="29px">
            <StyledGridHeader position="left">Imported data</StyledGridHeader>
            <StyledGridHeader position="right">Twenty fields</StyledGridHeader>
          </StyledGridRow>
          {columns.map((column, index) => {
            const userColumn = renderUserColumn(columns, index);
            const templateColumn = renderTemplateColumn(columns, index);
            const unmatchedColumn = renderUnmatchedColumn(columns, index);
            const isSelect = 'matchedOptions' in columns[index];
            const isLast = index === columns.length - 1;

            if (React.isValidElement(userColumn)) {
              return (
                <div key={index}>
                  <StyledGridRow withBorder={!isSelect && !isLast}>
                    <StyledGridCell position="left">
                      {userColumn}
                    </StyledGridCell>
                    <StyledGridCell position="right">
                      {templateColumn}
                    </StyledGridCell>
                  </StyledGridRow>
                  {isSelect && (
                    <StyledGridRow withBorder={!isLast}>
                      <StyledGridCell position="full-line">
                        {unmatchedColumn}
                      </StyledGridCell>
                    </StyledGridRow>
                  )}
                </div>
              );
            }

            return null;
          })}
        </StyledGrid>
      </StyledGridContainer>
    </>
  );
};
