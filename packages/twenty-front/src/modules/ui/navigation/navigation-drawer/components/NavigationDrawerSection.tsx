import styled from '@emotion/styled';

const StyledSection = styled.div<{
  isMobile?: boolean;
}>`
  display: flex;
  gap: ${({ theme, isMobile }) =>
    isMobile ? theme.spacing(3) : theme.betweenSiblingsGap};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  overflow: hidden;
  flex-direction: ${({ isMobile }) => (isMobile ? 'row' : 'column')};
  min-width: ${({ isMobile }) => (isMobile ? '20%' : '')};
  flex-shrink: 1;
`;

export { StyledSection as NavigationDrawerSection };
