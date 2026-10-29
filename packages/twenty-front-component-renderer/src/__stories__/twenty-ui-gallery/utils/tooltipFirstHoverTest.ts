import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectPopupAttachedToAnchor } from '@/__stories__/twenty-ui-gallery/utils/expectPopupAttachedToAnchor';

const PROJECT_HELP = 'Project progress is calculated from completed tasks.';

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
        expectPopupAttachedToAnchor({ popup: tooltip, anchor: trigger });
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
