import styled from '@emotion/styled';

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const AdvancedFilterDropdownRow = StyledRow;
