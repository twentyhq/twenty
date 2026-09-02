import {
  computePosition,
  flip,
  offset,
  shift,
  type Platform,
} from '@floating-ui/core';

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

export const getFloatingMenuPosition = async ({
  anchorRect,
  menuWidth,
  menuHeight,
  viewportWidth,
  viewportHeight,
}: GetFloatingMenuPositionParams): Promise<{ top: number; left: number }> => {
  const platform: Platform = {
    getElementRects: () => ({
      reference: {
        x: anchorRect.left,
        y: anchorRect.top,
        width: anchorRect.width,
        height: anchorRect.bottom - anchorRect.top,
      },
      floating: {
        x: 0,
        y: 0,
        width: menuWidth,
        height: menuHeight,
      },
    }),
    getClippingRect: () => ({
      x: 0,
      y: 0,
      width: viewportWidth,
      height: viewportHeight,
    }),
    getDimensions: () => ({ width: menuWidth, height: menuHeight }),
  };

  const { x, y } = await computePosition(undefined, undefined, {
    platform,
    placement: 'bottom-end',
    strategy: 'fixed',
    middleware: [
      offset(FLOATING_MENU_GAP_PIXELS),
      flip({ padding: FLOATING_MENU_VIEWPORT_MARGIN_PIXELS }),
      shift({
        padding: FLOATING_MENU_VIEWPORT_MARGIN_PIXELS,
        crossAxis: true,
      }),
    ],
  });

  return { top: y, left: x };
};
