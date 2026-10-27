import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { MAXIMUM_DROPDOWN_TRIGGER_GAP } from '@/__stories__/twenty-ui-gallery/constants/MaximumDropdownTriggerGap';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { computePopupAnchorGapAndOverlap } from '@/__stories__/twenty-ui-gallery/utils/computePopupAnchorGapAndOverlap';

const POPUP_POSITION_ROUNDING_TOLERANCE = 1;

export const popoverTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Account details' });

  const openPopover = async () => {
    await userEvent.click(trigger);
    await waitFor(
      () => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        const popup = page.getByRole('dialog', { name: 'Account owner' });
        expect(popup).toBeVisible();
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
          anchor: trigger.getBoundingClientRect(),
          popup: popupRectangle,
          side: popup.getAttribute('data-side'),
        });
        expect(popupAnchorGap).toBeGreaterThanOrEqual(
          -POPUP_POSITION_ROUNDING_TOLERANCE,
        );
        expect(popupAnchorGap).toBeLessThanOrEqual(
          MAXIMUM_DROPDOWN_TRIGGER_GAP,
        );
        expect(popupOverlapStart).toBeLessThan(anchorOverlapEnd);
        expect(popupOverlapEnd).toBeGreaterThan(anchorOverlapStart);
        expectElementToReceivePointer(
          within(popup).getByRole('button', { name: 'Close details' }),
        );
      },
      { timeout: INTERACTION_TIMEOUT },
    );
  };

  const expectPopoverClosed = async () => {
    await waitFor(
      () => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(
          page.queryByRole('dialog', { name: 'Account owner' }),
        ).not.toBeInTheDocument();
      },
      { timeout: INTERACTION_TIMEOUT },
    );
  };

  expect(trigger).toHaveAttribute('data-native-trigger', 'account');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await openPopover();
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Details: open; reason: trigger-press; target: account',
  );
  await userEvent.click(trigger);
  await expectPopoverClosed();
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Details: closed; reason: trigger-press; target: account',
  );
  await openPopover();
  await userEvent.click(page.getByRole('button', { name: 'Close details' }));
  await expectPopoverClosed();
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Details: closed; reason: close-press; target: account',
  );
  await openPopover();
  await userEvent.keyboard('{Escape}');
  await expectPopoverClosed();
  await openPopover();
  await userEvent.click(canvasElement);
  await expectPopoverClosed();
  expect(errorHandler).not.toHaveBeenCalled();
};
