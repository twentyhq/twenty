import { ReactNode } from 'react';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import styled from '@emotion/styled';

const StyledFixedContainer = styled.div<{ isSettings?: boolean }>`
  ${({ isSettings, theme }) =>
    isSettings
      ? `
  padding-left: ${theme.spacing(5)};
`
      : ''}
`;
export const NavigationDrawerFixedContent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isSettingsDrawer = useIsSettingsDrawer();

  return (
    <StyledFixedContainer isSettings={isSettingsDrawer}>
      <NavigationDrawerSection>{children}</NavigationDrawerSection>
    </StyledFixedContainer>
  );
};
