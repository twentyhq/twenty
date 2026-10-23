import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { focusWithoutScrolling } from '@/__stories__/twenty-ui-gallery/utils/focusWithoutScrolling';
import { waitForGeometryTrackerToIdle } from '@/__stories__/twenty-ui-gallery/utils/waitForGeometryTrackerToIdle';

const HOST_SCROLL_TOP = 200;

export const scrollEventEchoTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const keyboardScroller = canvas.getByRole('region', {
    name: 'Keyboard scroller',
  });
  const scrollAfterKeydownSerialization = () => {
    keyboardScroller.scrollTop = HOST_SCROLL_TOP;
  };

  await focusWithoutScrolling(keyboardScroller);
  canvasElement.ownerDocument.addEventListener(
    'keydown',
    scrollAfterKeydownSerialization,
    { once: true },
  );
  await userEvent.keyboard('a');

  await waitFor(
    () =>
      expect(
        canvas.getByRole('status', { name: 'Keyboard scroll keys' }),
      ).toHaveTextContent('1'),
    { timeout: INTERACTION_TIMEOUT },
  );
  await waitForGeometryTrackerToIdle();

  await expect(keyboardScroller.scrollTop).toBe(HOST_SCROLL_TOP);
  await expect(errorHandler).not.toHaveBeenCalled();
};
