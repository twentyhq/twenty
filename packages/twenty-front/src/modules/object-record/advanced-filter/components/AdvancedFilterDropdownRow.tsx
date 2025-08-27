import { styled } from '@linaria/react';

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const AdvancedFilterDropdownRow = StyledRow;
