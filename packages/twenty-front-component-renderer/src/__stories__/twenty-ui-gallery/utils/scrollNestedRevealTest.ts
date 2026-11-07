import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectElementWithinScrollport';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { readScrollportRectangle } from '@/__stories__/shared/test-utils/readScrollportRectangle';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { readHostScrollBoundary } from '@/__stories__/twenty-ui-gallery/utils/readHostScrollBoundary';

const CENTER_TOLERANCE = 1;

export const scrollNestedRevealTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const outerScroller = canvas.getByRole('region', { name: 'Outer scroller' });
  const innerScroller = canvas.getByRole('region', { name: 'Inner scroller' });
  const row = canvas.getByText('Row 25');
  const hostScrollBoundaryBeforeReveal = readHostScrollBoundary(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: 'Reveal row 25' }));

  await waitFor(
    () => {
      expect(outerScroller.scrollTop).toBeGreaterThan(0);
      expectElementWithinScrollport({
        element: row,
        scrollContainer: innerScroller,
      });
      expectElementWithinScrollport({
        element: row,
        scrollContainer: outerScroller,
      });
    },
    { timeout: INTERACTION_TIMEOUT },
  );

  await userEvent.click(canvas.getByRole('button', { name: 'Center row 25' }));

  await waitFor(
    () => {
      const rowRectangle = row.getBoundingClientRect();
      const { top, bottom } = readScrollportRectangle(innerScroller);

      expect(
        Math.abs(
          rowRectangle.top + rowRectangle.height / 2 - (top + bottom) / 2,
        ),
      ).toBeLessThanOrEqual(CENTER_TOLERANCE);
    },
    { timeout: INTERACTION_TIMEOUT },
  );
  await expect(readHostScrollBoundary(canvasElement)).toEqual(
    hostScrollBoundaryBeforeReveal,
  );
  await expect(errorHandler).not.toHaveBeenCalled();
};
