import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ROUND_TRIP_SETTLE_DELAY } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const waitForSandboxRoundTrip = () =>
  new Promise((resolve) =>
    setTimeout(resolve, SANDBOX_ROUND_TRIP_SETTLE_DELAY),
  );

export const overflowingListEventIsolationTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expectFrontComponentMounted(canvas);

    const trigger = await canvas.findByRole('button', {
      name: /Show all targets$/,
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const popup = await page.findByRole('dialog', { name: 'Show all targets' });
    const lastTarget = within(popup).getByRole('button', { name: 'Delta' });
    await waitFor(() => expect(lastTarget).toBeVisible());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await waitForSandboxRoundTrip();
    expect(canvas.getByLabelText('Host activations')).toHaveTextContent('0');

    await userEvent.click(lastTarget);
    await waitFor(() =>
      expect(canvas.getByLabelText('Selected target')).toHaveTextContent(
        'Delta',
      ),
    );

    await waitForSandboxRoundTrip();
    expect(canvas.getByLabelText('Host activations')).toHaveTextContent('0');
    expect(errorHandler).not.toHaveBeenCalled();
  };
