import { MobileNavigationBarItem } from '@/navigation/components/MobileNavigationBarItem';
import { MobileNavigationBarScrollEffect } from '@/navigation/components/MobileNavigationBarScrollEffect';
import { MOBILE_NAVIGATION_BAR_PADDING } from '@/navigation/constants/MobileNavigationBarPadding';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { Separator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';
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

  @media print {
    display: none;
  }
`;

const StyledNavigationBar = styled.nav`
  align-items: center;
  backdrop-filter: ${themeCssVariables.blur.strong};
  background: ${themeCssVariables.background.transparent.primary};
  border: 1px solid ${themeCssVariables.border.color.transparentStrong};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  corner-shape: round;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
  pointer-events: auto;
  transition:
    opacity calc(${themeCssVariables.animation.duration.normal} * 1s) ease,
    transform calc(${themeCssVariables.animation.duration.normal} * 1s) ease,
    visibility calc(${themeCssVariables.animation.duration.normal} * 1s);
  width: max-content;

  &[data-hidden] {
    opacity: 0;
    pointer-events: none;
    transform: translateY(calc(100% + ${themeCssVariables.spacing[4]}));
    visibility: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledSeparatorContainer = styled.div`
  align-self: center;
  display: flex;
  height: ${themeCssVariables.spacing[5]};
`;

export const MobileNavigationBar = () => {
  const { pathname } = useLocation();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const isMobileNavigationBarVisible = useAtomStateValue(
    isMobileNavigationBarVisibleState,
  );
  const { items, activeItemName } = useMobileNavigationBarItems();
  const tabItems = items.filter(({ kind }) => kind === 'tab');
  const actionItems = items.filter(({ kind }) => kind === 'action');

  // The chat page keeps the keyboard up and carries its own close button.
  const isHidden =
    isSidePanelOpened ||
    !isMobileNavigationBarVisible ||
    isAiChatPath(pathname);

  return (
    <>
      <MobileNavigationBarScrollEffect />
      <StyledFloatingContainer>
        <StyledNavigationBar
          data-hidden={isHidden ? '' : undefined}
          aria-hidden={isHidden}
          inert={isHidden || undefined}
        >
          {tabItems.map((item) => (
            <MobileNavigationBarItem
              key={item.name}
              item={item}
              isActive={activeItemName === item.name}
              isHidden={isHidden}
            />
          ))}
          {tabItems.length > 1 && (
            <StyledSeparatorContainer>
              <Separator orientation="vertical" />
            </StyledSeparatorContainer>
          )}
          {actionItems.map((item) => (
            <MobileNavigationBarItem
              key={item.name}
              item={item}
              isActive={activeItemName === item.name}
              isHidden={isHidden}
            />
          ))}
        </StyledNavigationBar>
      </StyledFloatingContainer>
    </>
  );
};
