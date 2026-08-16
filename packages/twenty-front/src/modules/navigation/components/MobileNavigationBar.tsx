import { MobileNavigationBarScrollEffect } from '@/navigation/components/MobileNavigationBarScrollEffect';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { NavigationBar } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBarContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[3]};
  padding-bottom: calc(
    ${themeCssVariables.spacing[3]} + env(safe-area-inset-bottom, 0px)
  );
  z-index: ${RootStackingContextZIndices.MobileNavigationBar};

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

  const isHidden = isSidePanelOpened || !isMobileNavigationBarVisible;

  return (
    <>
      <MobileNavigationBarScrollEffect />
      <StyledBarContainer>
        <NavigationBar
          activeItemName={activeItemName}
          isHidden={isHidden}
          items={items}
        />
      </StyledBarContainer>
    </>
  );
};
