import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const scrollReadAfterWriteTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  await userEvent.click(canvas.getByRole('button', { name: 'Write log 120' }));

  await waitFor(
    () => {
      expect(
        canvas.getByRole('status', { name: 'Log reads' }),
      ).toHaveTextContent('sync:120;next:120');
      expect(canvas.getByRole('region', { name: 'Log' }).scrollTop).toBe(120);
    },
    { timeout: INTERACTION_TIMEOUT },
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Write chips -120' }),
  );

  await waitFor(
    () => {
      expect(
        canvas.getByRole('status', { name: 'Chip reads' }),
      ).toHaveTextContent('sync:-120;next:-120');
      expect(canvas.getByRole('region', { name: 'RTL chips' }).scrollLeft).toBe(
        -120,
      );
    },
    { timeout: INTERACTION_TIMEOUT },
  );
  await expect(errorHandler).not.toHaveBeenCalled();
};
