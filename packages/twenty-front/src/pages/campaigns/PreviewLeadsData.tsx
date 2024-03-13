import { useNavigate } from 'react-router-dom';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';

const StyledTable = styled.table`
  width: 50%;
  border-collapse: collapse;
  height: 10px ;

`;

const StyledTableRow = styled.tr`
  &:nth-of-type(odd) {
    background-color: ${({ theme }) => theme.background.primary};
  }
  &:nth-of-type(even) {
    background-color: ${({ theme }) => theme.background.transparent};
  }
`;

const StyledTableCell = styled.td`
  padding: 5px;
  // border: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.sm}
`;

const StyledTableHeader =  styled.thead`
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  background-color: ${({ theme }) => theme.background.quaternary};

`
export const PreviewLeadsData = ({data}) => {
  const navigate = useNavigate();

  const handleRowClick = (templateName: string) => {
    navigate(`/${templateName.toLowerCase()}`);
  };

  return (
 
    <StyledTable>
           <tbody>
        <StyledTableRow>
        <StyledTableCell>Name</StyledTableCell>
        <StyledTableCell>Email</StyledTableCell>
        <StyledTableCell>Age</StyledTableCell>
        <StyledTableCell>Location</StyledTableCell>
        <StyledTableCell>Campaign Name</StyledTableCell>
        <StyledTableCell>Advertisement Source</StyledTableCell>
        <StyledTableCell>Phone Number</StyledTableCell>
        <StyledTableCell>Comments</StyledTableCell>
        <StyledTableCell>Advertisement Name</StyledTableCell>
        </StyledTableRow>
        {data?.leads?.edges.map((leads: any) => (
        <StyledTableRow key={leads.node.id}>
            <StyledTableCell>{leads.node?.name}</StyledTableCell>
            <StyledTableCell>{leads.node?.email}</StyledTableCell>
            <StyledTableCell>{leads.node.age}</StyledTableCell>

            <StyledTableCell>{leads.node.location}</StyledTableCell>

            <StyledTableCell>{leads.node.campaignName}</StyledTableCell>

            <StyledTableCell>{leads.node.advertisementSource}</StyledTableCell>
            <StyledTableCell>{leads.node.phoneNumber}</StyledTableCell>

            <StyledTableCell>{leads.node.comments}</StyledTableCell>
            <StyledTableCell>{leads.node.advertisementName}</StyledTableCell>
        </StyledTableRow>
        ))}

    </tbody>
    </StyledTable>

  );
};