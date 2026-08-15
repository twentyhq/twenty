import { MobileNavigationBarScrollEffect } from '@/navigation/components/MobileNavigationBarScrollEffect';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { NavigationBar } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// In the layout flow rather than over it, so the band the bar occupies is
// exactly its own size and no page has to reserve room for it. flex-start
// rather than left so the bar follows the writing direction in RTL locales.
const StyledBarContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-start;
  padding: ${themeCssVariables.spacing[3]};
  padding-bottom: calc(
    ${themeCssVariables.spacing[3]} + env(safe-area-inset-bottom, 0px)
  );
  pointer-events: none;
  position: relative;
  z-index: ${RootStackingContextZIndices.MobileNavigationBar};

  > * {
    pointer-events: auto;
  }

  @media print {
    display: none;
  }
`;

export const MobileNavigationBar = () => {
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const isMobileNavigationBarVisible = useAtomStateValue(
    isMobileNavigationBarVisibleState,
  );
  const { items, activeItemName } = useMobileNavigationBarItems();

  // The side panel is full screen on mobile, so the bar would be floating over
  // a view it does not navigate. It comes back when the panel closes.
  const isHidden = isSidePanelOpened || !isMobileNavigationBarVisible;

  return (
    <>
      <MobileNavigationBarScrollEffect />
      <StyledBarContainer>
        <NavigationBar
          activeItemName={activeItemName ?? ''}
          isHidden={isHidden}
          items={items}
        />
      </StyledBarContainer>
    </>
  );
};
