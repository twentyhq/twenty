import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

import { standardObjects } from '../../constants/mockObjects';

const StyledTableRow = styled(TableRow)<{
  selectedRows?: number[];
  rowNumber?: number;
}>`
  align-items: center;
  background: ${({ selectedRows, rowNumber, theme }) =>
    selectedRows?.includes(rowNumber!)
      ? theme.accent.quaternary
      : theme.background.primary};
  grid-template-columns: 36px 132px 240px 98.7px;
`;

const StyledCheckboxCell = styled(TableCell)`
  padding: 0 ${({ theme }) => theme.spacing(2)} 0
    ${({ theme }) => theme.spacing(1)};
`;

const StyledNameTableCell = styled(TableCell)`
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDescriptionCell = styled.div<{
  align?: 'left' | 'center' | 'right';
}>`
  color: ${({ theme }) => theme.font.color.secondary};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
      ? 'center'
      : 'flex-start'};
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  text-align: ${({ align }) => align ?? 'left'};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTable = styled(Table)`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsStandardObjects = () => {
  const theme = useTheme();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  return (
    <>
      <H2Title
        title="Available"
        description="Select one or several standard objects to activate below"
      />
      <StyledTable>
        <StyledTableRow>
          <TableHeader></TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Description</TableHeader>
          <TableHeader align="right">Fields</TableHeader>
        </StyledTableRow>
        {standardObjects.map((object, rowNumber) => (
          <StyledTableRow
            selectedRows={selectedRows}
            rowNumber={rowNumber}
            onClick={() => {
              const indexOfRowClicked = selectedRows.indexOf(rowNumber);
              if (indexOfRowClicked === -1) {
                setSelectedRows([...selectedRows, rowNumber]);
              } else {
                const newSelectedRows = [...selectedRows];
                newSelectedRows.splice(indexOfRowClicked, 1);
                setSelectedRows(newSelectedRows);
              }
            }}
            key={object.name}
          >
            <StyledCheckboxCell>
              <input
                type="checkbox"
                checked={selectedRows.includes(rowNumber)}
              />
            </StyledCheckboxCell>
            <StyledNameTableCell>
              <object.Icon size={theme.icon.size.md} />
              {object.name}
            </StyledNameTableCell>
            <StyledDescriptionCell>{object.description}</StyledDescriptionCell>
            <TableCell align="right">{object.fields}</TableCell>
          </StyledTableRow>
        ))}
      </StyledTable>
    </>
  );
};
