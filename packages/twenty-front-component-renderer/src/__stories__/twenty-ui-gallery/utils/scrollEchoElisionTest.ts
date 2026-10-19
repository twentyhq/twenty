import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { waitForGeometryTrackerToIdle } from '@/__stories__/twenty-ui-gallery/utils/waitForGeometryTrackerToIdle';

const HOST_SCROLL_TOP = 200;

export const scrollEchoElisionTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const echoTarget = canvas.getByRole('region', { name: 'Echo target' });

  await userEvent.click(
    canvas.getByRole('button', { name: 'Read echo position' }),
  );
  await waitFor(
    () =>
      expect(
        canvas.getByRole('status', { name: 'Echo read' }),
      ).toHaveTextContent('0'),
    { timeout: INTERACTION_TIMEOUT },
  );

  echoTarget.scrollTop = HOST_SCROLL_TOP;
  await waitForGeometryTrackerToIdle();

  await userEvent.click(canvas.getByRole('button', { name: 'Echo position' }));
  await waitForGeometryTrackerToIdle();

  await expect(echoTarget.scrollTop).toBe(HOST_SCROLL_TOP);
  await expect(errorHandler).not.toHaveBeenCalled();
};
