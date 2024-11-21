import styled from '@emotion/styled';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  flex-shrink: 1;
`;

export { StyledSection as NavigationDrawerSection };
