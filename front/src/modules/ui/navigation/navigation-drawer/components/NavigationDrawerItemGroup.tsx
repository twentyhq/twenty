import styled from '@emotion/styled';

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

export { StyledGroup as NavigationDrawerItemGroup };
