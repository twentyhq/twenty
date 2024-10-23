import styled from '@emotion/styled';

const StyledSection = styled.div<{
  isMobile?: boolean;
}>`
  display: flex;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  flex-shrink: 1;
  overflow: hidden;
  flex-direction: ${({ isMobile }) => isMobile ? "row" : "column"};
  width: ${({ isMobile }) => isMobile ? '20%' : 'auto'};
  `;

export { StyledSection as NavigationDrawerSection };
