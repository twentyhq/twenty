import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui-deprecated/utilities';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

const StyledNavigationDrawerScrollWrapper = styled(ScrollWrapper)`
  flex: 1 1 auto;
  min-height: 0;
`;

const StyledScrollableMobileInnerContainer = styled.div`
  height: 100%;
  min-height: 0;
  padding-left: ${themeCssVariables.spacing[5]};
  padding-right: ${themeCssVariables.spacing[5]};
`;

export const NavigationDrawerScrollableContent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isSettingsDrawer = useIsSettingsDrawer();
  const isMobile = useIsMobile();

  return (
    <StyledNavigationDrawerScrollWrapper
      componentInstanceId={`scroll-wrapper-${
        isSettingsDrawer ? 'settings-' : ''
      }navigation-drawer`}
      defaultEnableXScroll={false}
    >
      <StyledItemsContainer>
        {isMobile ? (
          <StyledScrollableMobileInnerContainer>
            {children}
          </StyledScrollableMobileInnerContainer>
        ) : (
          <>{children}</>
        )}
      </StyledItemsContainer>
    </StyledNavigationDrawerScrollWrapper>
  );
};
