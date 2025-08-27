import { styled } from '@linaria/react';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowAdvancedFilterDropdownColumn = StyledColumn;
