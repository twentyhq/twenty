import { expect } from 'storybook/test';

import { MAXIMUM_DROPDOWN_TRIGGER_GAP } from '@/__stories__/twenty-ui-gallery/constants/MaximumDropdownTriggerGap';
import { POPUP_POSITION_ROUNDING_TOLERANCE } from '@/__stories__/twenty-ui-gallery/constants/PopupPositionRoundingTolerance';
import { computePopupAnchorGapAndOverlap } from '@/__stories__/twenty-ui-gallery/utils/computePopupAnchorGapAndOverlap';

export const expectPopupAttachedToAnchor = ({
  popup,
  anchor,
}: {
  popup: Element;
  anchor: Element;
}) => {
  const popupRectangle = popup.getBoundingClientRect();
  expect(popupRectangle.width).toBeGreaterThan(0);
  expect(popupRectangle.height).toBeGreaterThan(0);
  const {
    popupAnchorGap,
    popupOverlapStart,
    popupOverlapEnd,
    anchorOverlapStart,
    anchorOverlapEnd,
  } = computePopupAnchorGapAndOverlap({
    anchor: anchor.getBoundingClientRect(),
    popup: popupRectangle,
    side: popup.getAttribute('data-side'),
  });
  expect(popupAnchorGap).toBeGreaterThanOrEqual(
    -POPUP_POSITION_ROUNDING_TOLERANCE,
  );
  expect(popupAnchorGap).toBeLessThanOrEqual(MAXIMUM_DROPDOWN_TRIGGER_GAP);
  expect(popupOverlapStart).toBeLessThan(anchorOverlapEnd);
  expect(popupOverlapEnd).toBeGreaterThan(anchorOverlapStart);
};
