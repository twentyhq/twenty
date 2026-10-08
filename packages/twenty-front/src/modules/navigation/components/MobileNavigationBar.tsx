import { MobileNavigationBarScrollEffect } from '@/navigation/components/MobileNavigationBarScrollEffect';
import { MOBILE_NAVIGATION_BAR_PADDING } from '@/navigation/constants/MobileNavigationBarPadding';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { IconButton } from 'twenty-ui/components/input';
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

const navigationButtonClassName = css`
  && {
    --tw-button-size: ${themeCssVariables.spacing[10]};
    --tw-icon-button-icon-size: ${themeCssVariables.icon.size.lg};

    border: none;
    color: ${themeCssVariables.grayScale.gray10};
    transition: background-color
      calc(${themeCssVariables.animation.duration.fast} * 1s) ease;

    &[aria-pressed='true'] {
      background: ${themeCssVariables.background.transparent.medium};
    }

    @media (hover: hover) {
      &:hover {
        background: ${themeCssVariables.background.transparent.light};
      }
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
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
        <StyledNavigationBar
          data-hidden={isHidden ? '' : undefined}
          aria-hidden={isHidden}
          inert={isHidden || undefined}
        >
          {items.map(({ Icon, name, label, onClick }) => (
            <IconButton
              key={name}
              className={navigationButtonClassName}
              variant="ghost"
              shape="round"
              aria-label={label}
              aria-pressed={activeItemName === name}
              onClick={onClick}
              tabIndex={isHidden ? -1 : 0}
            >
              <Icon aria-hidden />
            </IconButton>
          ))}
        </StyledNavigationBar>
      </StyledFloatingContainer>
    </>
  );
};
