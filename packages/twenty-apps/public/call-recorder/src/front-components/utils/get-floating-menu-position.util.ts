import {
  FLOATING_MENU_GAP_PIXELS,
  FLOATING_MENU_VIEWPORT_MARGIN_PIXELS,
} from 'src/front-components/constants/floating-menu.constant';
import { type AnchorRect } from 'src/front-components/types/anchor-rect.type';

type GetFloatingMenuPositionParams = {
  anchorRect: AnchorRect;
  menuWidth: number;
  menuHeight: number;
  viewportWidth: number;
  viewportHeight: number;
};

export const getFloatingMenuPosition = ({
  anchorRect,
  menuWidth,
  menuHeight,
  viewportWidth,
  viewportHeight,
}: GetFloatingMenuPositionParams): { top: number; left: number } => {
  const spaceBelow = viewportHeight - anchorRect.bottom;
  const shouldFlipAbove =
    spaceBelow < menuHeight + FLOATING_MENU_GAP_PIXELS &&
    anchorRect.top > spaceBelow;

  const unclampedTop = shouldFlipAbove
    ? anchorRect.top - menuHeight - FLOATING_MENU_GAP_PIXELS
    : anchorRect.bottom + FLOATING_MENU_GAP_PIXELS;

  const maxTop = Math.max(
    FLOATING_MENU_VIEWPORT_MARGIN_PIXELS,
    viewportHeight - menuHeight - FLOATING_MENU_VIEWPORT_MARGIN_PIXELS,
  );

  const unclampedLeft = anchorRect.left + anchorRect.width - menuWidth;
  const maxLeft = Math.max(
    FLOATING_MENU_VIEWPORT_MARGIN_PIXELS,
    viewportWidth - menuWidth - FLOATING_MENU_VIEWPORT_MARGIN_PIXELS,
  );

  return {
    top: Math.min(
      Math.max(unclampedTop, FLOATING_MENU_VIEWPORT_MARGIN_PIXELS),
      maxTop,
    ),
    left: Math.min(
      Math.max(unclampedLeft, FLOATING_MENU_VIEWPORT_MARGIN_PIXELS),
      maxLeft,
    ),
  };
};
