import { type ReactNode } from 'react';

import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { styled } from '@linaria/react';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFixedContainer = styled.div<{ isMobile?: boolean }>`
  padding-left: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
  padding-right: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
`;

export const NavigationDrawerFixedContent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isMobile = useIsMobile();

  return (
    <StyledFixedContainer isMobile={isMobile}>
      <NavigationDrawerSection>{children}</NavigationDrawerSection>
    </StyledFixedContainer>
  );
};
