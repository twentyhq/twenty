import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

import { standardObjects } from '../../constants/mockObjects';

const StyledTableRow = styled(TableRow)`
  align-items: center;
  grid-template-columns: 36px 132px 240px 98.7px;
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

export const SettingsStandardObjects = () => {
  const theme = useTheme();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const selectRowHander = (event: any) => {
    const value = parseInt(event.target.value, 10);
    if (event.target.checked) {
      setSelectedRows([...selectedRows, value]);
    } else {
      const newSelectedRows = [...selectedRows];
      newSelectedRows.splice(selectedRows.indexOf(value), 1);
      setSelectedRows(newSelectedRows);
    }
  };
  return (
    <>
      <H2Title
        title="Available"
        description="Select one or several standard objects to activate below"
      />
      <Table>
        <StyledTableRow>
          <TableHeader></TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Description</TableHeader>
          <TableHeader align="right">Fields</TableHeader>
        </StyledTableRow>
        {standardObjects.map((object, index) => (
          <StyledTableRow
            style={
              selectedRows.includes(index)
                ? { background: theme.background.quaternary }
                : { background: theme.background.primary }
            }
            key={object.name}
          >
            <TableCell>
              <input type="checkbox" value={index} onChange={selectRowHander} />
            </TableCell>
            <TableCell>
              <object.Icon size={theme.icon.size.md} />
              {object.name}
            </TableCell>
            <StyledDescriptionCell>{object.description}</StyledDescriptionCell>
            <TableCell align="right">{object.fields}</TableCell>
          </StyledTableRow>
        ))}
      </Table>
    </>
  );
};
