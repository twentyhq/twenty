import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

const StyledTable = styled.table`
  width: 50%;
  border-collapse: collapse;
  height: 10px;
`;

const StyledTableRow = styled.tr`
  background-color: ${({ theme }) => theme.background.danger};
`;

const StyledTableCell = styled.td`
  padding: 5px;
  // border: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const PreviewLeadsData = ({ data }) => {
  const navigate = useNavigate();

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
