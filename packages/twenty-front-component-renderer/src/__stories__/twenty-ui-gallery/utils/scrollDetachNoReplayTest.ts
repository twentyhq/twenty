import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { waitForGeometryTrackerToIdle } from '@/__stories__/twenty-ui-gallery/utils/waitForGeometryTrackerToIdle';

export const scrollDetachNoReplayTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  await canvas.findByRole(
    'region',
    { name: 'Detachable scroller' },
    { timeout: INTERACTION_TIMEOUT },
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Write and detach' }),
  );
  await waitForGeometryTrackerToIdle();
  await expect(
    canvas.queryByRole('region', { name: 'Detachable scroller' }),
  ).toBeNull();

  await userEvent.click(canvas.getByRole('button', { name: 'Reattach' }));

  const reattachedScroller = await canvas.findByRole(
    'region',
    { name: 'Detachable scroller' },
    { timeout: INTERACTION_TIMEOUT },
  );

  await waitForGeometryTrackerToIdle();

  await expect(reattachedScroller.scrollTop).toBe(0);
  await expect(errorHandler).not.toHaveBeenCalled();
};
