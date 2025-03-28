import { ReactNode } from 'react';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import styled from '@emotion/styled';

const StyledFixedContainer = styled.div<{ isSettings?: boolean }>`
  ${({ isSettings, theme }) =>
    isSettings
      ? `
  padding-left: ${theme.spacing(5)};
  padding-right: ${theme.spacing(8)};
`
      : ''}
`;
export const NavigationDrawerFixedContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const isSettingsDrawer = useIsSettingsDrawer();

  return (
    <StyledFixedContainer isSettings={isSettingsDrawer} className={className}>
      <NavigationDrawerSection>{children}</NavigationDrawerSection>
    </StyledFixedContainer>
  );
};
