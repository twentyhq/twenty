import styled from '@emotion/styled';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  FLOATING_MENU_MAX_HEIGHT_PIXELS,
  FLOATING_MENU_VIEWPORT_MARGIN_PIXELS,
} from 'src/front-components/constants/floating-menu.constant';
import { type AnchorRect } from 'src/front-components/types/anchor-rect.type';
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
  z-index: 2001;
`;

type FloatingMenuProps = {
  anchorRect: AnchorRect;
  width: number;
  onClose: () => void;
  children: ReactNode;
};

export const FloatingMenu = ({
  anchorRect,
  width,
  onClose,
  children,
}: FloatingMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuHeight, setMenuHeight] = useState<number | undefined>(undefined);

  // Positioning against the max height would flip a two-item menu above its
  // anchor, so the real height is measured once painted and kept in sync as
  // the content filters down.
  useEffect(() => {
    const measuredHeight = menuRef.current?.offsetHeight;

    if (
      measuredHeight !== undefined &&
      measuredHeight > 0 &&
      measuredHeight !== menuHeight
    ) {
      setMenuHeight(measuredHeight);
    }
  });

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const { top, left } = getFloatingMenuPosition({
    anchorRect,
    menuWidth: width,
    menuHeight: menuHeight ?? FLOATING_MENU_MAX_HEIGHT_PIXELS,
    viewportWidth:
      viewportWidth > 0 ? viewportWidth : width + FLOATING_MENU_VIEWPORT_MARGIN_PIXELS * 2,
    viewportHeight:
      viewportHeight > 0
        ? viewportHeight
        : anchorRect.bottom + FLOATING_MENU_MAX_HEIGHT_PIXELS,
  });

  return (
    <>
      <StyledBackdrop onClick={onClose} />
      <StyledMenu
        ref={menuRef}
        style={{
          top,
          left,
          width,
          visibility: menuHeight === undefined ? 'hidden' : 'visible',
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
