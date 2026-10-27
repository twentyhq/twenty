import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { MAXIMUM_DROPDOWN_TRIGGER_GAP } from '@/__stories__/twenty-ui-gallery/constants/MaximumDropdownTriggerGap';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { computePopupAnchorGapAndOverlap } from '@/__stories__/twenty-ui-gallery/utils/computePopupAnchorGapAndOverlap';

const PROJECT_HELP = 'Project progress is calculated from completed tasks.';
const POPUP_POSITION_ROUNDING_TOLERANCE = 1;

export const tooltipFirstHoverTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const user = userEvent.setup();
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: PROJECT_HELP });
  const icon = trigger.querySelector('svg');

  if (!isDefined(icon)) {
    throw new Error('The project information trigger must contain its icon');
  }

  const expectTooltipOpen = () =>
    waitFor(
      () => {
        const tooltip = page.getByRole('tooltip');
        expect(tooltip).toBeVisible();
        expect(tooltip).toHaveTextContent(PROJECT_HELP);
        const popupRectangle = tooltip.getBoundingClientRect();
        expect(popupRectangle.width).toBeGreaterThan(0);
        expect(popupRectangle.height).toBeGreaterThan(0);
        const {
          popupAnchorGap,
          popupOverlapStart,
          popupOverlapEnd,
          anchorOverlapStart,
          anchorOverlapEnd,
        } = computePopupAnchorGapAndOverlap({
          anchor: trigger.getBoundingClientRect(),
          popup: popupRectangle,
          side: tooltip.getAttribute('data-side'),
        });
        expect(popupAnchorGap).toBeGreaterThanOrEqual(
          -POPUP_POSITION_ROUNDING_TOLERANCE,
        );
        expect(popupAnchorGap).toBeLessThanOrEqual(
          MAXIMUM_DROPDOWN_TRIGGER_GAP,
        );
        expect(popupOverlapStart).toBeLessThan(anchorOverlapEnd);
        expect(popupOverlapEnd).toBeGreaterThan(anchorOverlapStart);
      },
      { timeout: INTERACTION_TIMEOUT },
    );

  const expectTooltipClosed = () =>
    waitFor(() => expect(page.queryByRole('tooltip')).not.toBeInTheDocument(), {
      timeout: INTERACTION_TIMEOUT,
    });

  expect(page.queryByRole('tooltip')).not.toBeInTheDocument();
  await waitForSandboxRoundTrip();
  await user.hover(trigger);
  await expectTooltipOpen();
  await user.unhover(trigger);
  await expectTooltipClosed();

  await user.hover(icon);
  await expectTooltipOpen();
  await user.unhover(icon);
  await expectTooltipClosed();

  await user.hover(icon);
  await expectTooltipOpen();
  await user.unhover(icon);
  await expectTooltipClosed();

  expect(errorHandler).not.toHaveBeenCalled();
};
