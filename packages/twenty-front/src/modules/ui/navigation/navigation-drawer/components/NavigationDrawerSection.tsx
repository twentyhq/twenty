import styled from '@emotion/styled';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
`;

export { StyledSection as NavigationDrawerSection };
