import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectElementWithinScrollport';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { readScrollportRectangle } from '@/__stories__/shared/test-utils/readScrollportRectangle';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const EDGE_TOLERANCE = 1;

export const scrollRtlRevealTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const chips = canvas.getByRole('region', { name: 'RTL chips' });
  const chip = canvas.getByText('Chip 18');

  await userEvent.click(canvas.getByRole('button', { name: 'Reveal chip 18' }));

  await waitFor(
    () => {
      expect(chips.scrollLeft).toBeLessThan(0);
      expectElementWithinScrollport({ element: chip, scrollContainer: chips });
    },
    { timeout: INTERACTION_TIMEOUT },
  );

  await userEvent.click(canvas.getByRole('button', { name: 'Start chip 18' }));

  await waitFor(
    () => {
      const scrollportRight = readScrollportRectangle(chips).right;

      expect(
        Math.abs(chip.getBoundingClientRect().right - scrollportRight),
      ).toBeLessThanOrEqual(EDGE_TOLERANCE);
    },
    { timeout: INTERACTION_TIMEOUT },
  );
  await expect(errorHandler).not.toHaveBeenCalled();
};
