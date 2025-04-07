import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledSection = styled.div<{ isSettingsDrawer?: boolean }>`
  margin-bottom: ${({ theme, isSettingsDrawer }) =>
    isSettingsDrawer ? theme.spacing(3) : 0};
  width: 100%;
`;

const StyledSectionInnerContainerMinusScrollPadding = styled.div<{
  isMobile: boolean;
  isSettingsDrawer: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
  width: ${({ isMobile, theme, isSettingsDrawer }) =>
    `calc(100% - ${isMobile || isSettingsDrawer ? 0 : theme.spacing(2)})`};
`;

export const NavigationDrawerSection = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  return (
    <StyledSection isSettingsDrawer={isSettingsDrawer}>
      <StyledSectionInnerContainerMinusScrollPadding
        isMobile={isMobile}
        isSettingsDrawer={isSettingsDrawer}
      >
        {children}
      </StyledSectionInnerContainerMinusScrollPadding>
    </StyledSection>
  );
};
