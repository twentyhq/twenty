import styled from '@emotion/styled';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const AdvancedFilterCommandMenuColumn = StyledColumn;
