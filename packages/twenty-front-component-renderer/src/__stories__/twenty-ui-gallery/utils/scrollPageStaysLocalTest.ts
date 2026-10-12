import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { readHostScrollBoundary } from '@/__stories__/twenty-ui-gallery/utils/readHostScrollBoundary';
import { waitForGeometryTrackerToIdle } from '@/__stories__/twenty-ui-gallery/utils/waitForGeometryTrackerToIdle';

export const scrollPageStaysLocalTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const tryPageScrollButton = canvas.getByRole('button', {
    name: 'Try page scroll',
  });

  await userEvent.click(tryPageScrollButton);

  const hostScrollBoundaryAfterClick = readHostScrollBoundary(canvasElement);

  await waitFor(
    () =>
      expect(
        canvas.getByRole('status', { name: 'Page scroll' }),
      ).toHaveTextContent('ok'),
    { timeout: INTERACTION_TIMEOUT },
  );
  await waitForGeometryTrackerToIdle();

  await expect(readHostScrollBoundary(canvasElement)).toEqual(
    hostScrollBoundaryAfterClick,
  );
  await expect(errorHandler).not.toHaveBeenCalled();
};
