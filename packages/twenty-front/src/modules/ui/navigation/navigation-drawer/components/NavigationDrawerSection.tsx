import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { styled } from '@linaria/react';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSection = styled.div<{ isSettingsDrawer?: boolean }>`
  margin-bottom: ${({ isSettingsDrawer }) =>
    isSettingsDrawer ? themeCssVariables.spacing[3] : '0'};
  width: 100%;
`;

const StyledSectionInnerContainerMinusScrollPadding = styled.div<{
  isMobile: boolean;
  isSettingsDrawer: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  width: ${({ isMobile, isSettingsDrawer }) =>
    isMobile || isSettingsDrawer
      ? '100%'
      : `calc(100% - ${themeCssVariables.spacing[2]})`};
`;

export const NavigationDrawerSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  return (
    <StyledSection isSettingsDrawer={isSettingsDrawer} className={className}>
      <StyledSectionInnerContainerMinusScrollPadding
        isMobile={isMobile}
        isSettingsDrawer={isSettingsDrawer}
      >
        {children}
      </StyledSectionInnerContainerMinusScrollPadding>
    </StyledSection>
  );
};
