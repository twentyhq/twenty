import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  overflow: hidden;
  flex: 1;
`;

const StyledScrollableInnerContainer = styled.div<{ isMobile?: boolean }>`
  height: 100%;
  padding-left: ${({ theme }) => theme.spacing(5)};
  padding-right: ${({ theme, isMobile }) =>
    isMobile ? theme.spacing(5) : theme.spacing(8)};
`;

export const NavigationDrawerScrollableContent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isSettingsDrawer = useIsSettingsDrawer();
  const isMobile = useIsMobile();

  return (
    <ScrollWrapper
      componentInstanceId={`scroll-wrapper-${
        isSettingsDrawer ? 'settings-' : ''
      }navigation-drawer`}
      defaultEnableXScroll={false}
    >
      <StyledItemsContainer>
        {isSettingsDrawer ? (
          <StyledScrollableInnerContainer isMobile={isMobile}>
            {children}
          </StyledScrollableInnerContainer>
        ) : (
          <>{children}</>
        )}
      </StyledItemsContainer>
    </ScrollWrapper>
  );
};
