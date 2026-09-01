import styled from '@emotion/styled';
import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  FLOATING_MENU_DEFAULT_WIDTH_PIXELS,
  FLOATING_MENU_MAX_HEIGHT_PIXELS,
  FLOATING_MENU_VIEWPORT_MARGIN_PIXELS,
} from 'src/front-components/constants/floating-menu.constant';
import { getFloatingMenuPosition } from 'src/front-components/utils/get-floating-menu-position.util';

// Card sets overflow: hidden, so the menu cannot be a child of the row. It is
// positioned against the viewport instead, and a backdrop stands in for the
// outside click the sandbox never receives from the host page.
const StyledBackdrop = styled.div`
  inset: 0;
  position: fixed;
  z-index: 2000;
`;

const StyledMenu = styled.div`
  background-color: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-shadow: ${() => themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
  max-height: ${FLOATING_MENU_MAX_HEIGHT_PIXELS}px;
  overflow: hidden;
  position: fixed;
  visibility: hidden;
  width: ${FLOATING_MENU_DEFAULT_WIDTH_PIXELS}px;
  z-index: 2001;
`;

type FloatingMenuProps = {
  anchorRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  children: ReactNode;
};

export const FloatingMenu = ({
  anchorRef,
  onClose,
  children,
}: FloatingMenuProps) => {
  const floatingMenuElementRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<
    { top: number; left: number } | undefined
  >(undefined);

  const setFloatingMenuElementRef = useCallback(
    (floatingMenuElement: HTMLDivElement | null) => {
      floatingMenuElementRef.current = floatingMenuElement;

      if (floatingMenuElement === null || anchorRef.current === null) {
        return;
      }

      // First reads enroll remote elements for geometry tracking.
      void anchorRef.current.getBoundingClientRect();
      void floatingMenuElement.offsetHeight;

      requestAnimationFrame(() => {
        const anchorElement = anchorRef.current;

        if (
          anchorElement === null ||
          floatingMenuElementRef.current !== floatingMenuElement
        ) {
          return;
        }

        const anchorDomRect = anchorElement.getBoundingClientRect();
        const menuHeight = floatingMenuElement.offsetHeight;

        if (anchorDomRect.width <= 0 || menuHeight <= 0) {
          return;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        void getFloatingMenuPosition({
          anchorRect: {
            top: anchorDomRect.top,
            left: anchorDomRect.left,
            bottom: anchorDomRect.bottom,
            width: anchorDomRect.width,
          },
          menuWidth: FLOATING_MENU_DEFAULT_WIDTH_PIXELS,
          menuHeight,
          viewportWidth:
            viewportWidth > 0
              ? viewportWidth
              : FLOATING_MENU_DEFAULT_WIDTH_PIXELS +
                FLOATING_MENU_VIEWPORT_MARGIN_PIXELS * 2,
          viewportHeight:
            viewportHeight > 0
              ? viewportHeight
              : anchorDomRect.bottom + FLOATING_MENU_MAX_HEIGHT_PIXELS,
        }).then((nextPosition) => {
          if (floatingMenuElementRef.current !== floatingMenuElement) {
            return;
          }

          setPosition(nextPosition);
        });
      });
    },
    [anchorRef],
  );

  return (
    <>
      <StyledBackdrop onClick={onClose} />
      <StyledMenu
        ref={setFloatingMenuElementRef}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          visibility: position === undefined ? 'hidden' : 'visible',
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onClose();
          }
        }}
      >
        {children}
      </StyledMenu>
    </>
  );
};
