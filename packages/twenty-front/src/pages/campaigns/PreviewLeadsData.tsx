import styled from '@emotion/styled';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  height: 10px;
`;

const StyledTableRow = styled.tr`
  &:nth-of-type(odd) {
    background-color: ${({ theme }) => theme.background.primary};
  }
  &:nth-of-type(even) {
    background-color: ${({ theme }) => theme.background.transparent.blue};
  }
`;

const StyledTableCell = styled.td`
  padding: 5px;
  // border: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 25px;
`;

const StyledTableHeaderCell = styled.td`
  padding: 5px;
  // border: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 25px;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;
export const PreviewLeadsData = ({ data }) => {
  return (
    <StyledTable>
      <tbody>
        <StyledTableRow>
          <StyledTableHeaderCell>Name</StyledTableHeaderCell>
          {/* <StyledTableHeaderCell>Email</StyledTableHeaderCell> */}
          <StyledTableHeaderCell>Age</StyledTableHeaderCell>
          <StyledTableHeaderCell>Location</StyledTableHeaderCell>
          <StyledTableHeaderCell>Campaign Name</StyledTableHeaderCell>
          <StyledTableHeaderCell>Advertisement Source</StyledTableHeaderCell>
          <StyledTableHeaderCell>Phone Number</StyledTableHeaderCell>
          <StyledTableHeaderCell>Comments</StyledTableHeaderCell>
          <StyledTableHeaderCell>Advertisement Name</StyledTableHeaderCell>
        </StyledTableRow>
        {data?.leads?.edges.map((leads: any) => (
          <StyledTableRow key={leads.node.id}>
            <StyledTableCell>{leads.node?.name}</StyledTableCell>
            {/* <StyledTableCell>{leads.node?.email}</StyledTableCell> */}
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
