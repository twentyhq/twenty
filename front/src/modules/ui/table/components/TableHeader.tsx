import styled from '@emotion/styled';

const StyledTableHeader = styled.th`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: ${({ theme }) => theme.spacing(8)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  text-align: left;
`;

export { StyledTableHeader as TableHeader };
