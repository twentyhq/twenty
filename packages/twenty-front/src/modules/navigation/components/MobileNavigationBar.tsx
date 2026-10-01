import { MobileNavigationBarScrollEffect } from '@/navigation/components/MobileNavigationBarScrollEffect';
import { MOBILE_NAVIGATION_BAR_PADDING } from '@/navigation/constants/MobileNavigationBarPadding';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { NavigationBar } from 'twenty-ui/components';
import { isAiChatPath } from '~/utils/isAiChatPath';

// Lets taps reach the page scrolling underneath; flex-start follows the writing direction.
const StyledFloatingContainer = styled.div`
  bottom: 0;
  display: flex;
  justify-content: flex-start;
  left: 0;
  padding: ${MOBILE_NAVIGATION_BAR_PADDING};
  padding-bottom: calc(
    ${MOBILE_NAVIGATION_BAR_PADDING} + env(safe-area-inset-bottom, 0px)
  );
  pointer-events: none;
  position: absolute;
  right: 0;
  z-index: ${RootStackingContextZIndices.MobileNavigationBar};

  > * {
    pointer-events: auto;
  }

  @media print {
    display: none;
  }
`;

export const MobileNavigationBar = () => {
  const { pathname } = useLocation();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const isMobileNavigationBarVisible = useAtomStateValue(
    isMobileNavigationBarVisibleState,
  );
  const { items, activeItemName } = useMobileNavigationBarItems();

  // The chat page keeps the keyboard up and carries its own close button.
  const isHidden =
    isSidePanelOpened ||
    !isMobileNavigationBarVisible ||
    isAiChatPath(pathname);

  return (
    <>
      <MobileNavigationBarScrollEffect />
      <StyledFloatingContainer>
        <NavigationBar
          activeItemName={activeItemName}
          isHidden={isHidden}
          items={items}
        />
      </StyledFloatingContainer>
    </>
  );
};
