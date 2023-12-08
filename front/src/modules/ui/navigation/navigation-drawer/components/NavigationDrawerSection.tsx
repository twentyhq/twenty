import styled from '@emotion/styled';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export { StyledSection as NavigationDrawerSection };
