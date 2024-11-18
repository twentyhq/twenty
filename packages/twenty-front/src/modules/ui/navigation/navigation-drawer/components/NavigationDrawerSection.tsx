import styled from '@emotion/styled';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  flex-shrink: 1;
  // I need to remove this line to display the advanced mode icon for the security item in SettingsNavigationDrawerItems
  // But it's necessary for this issue: https://github.com/twentyhq/twenty/issues/7733
  // Need help to define a good design for this case
  overflow: hidden;
`;

export { StyledSection as NavigationDrawerSection };
