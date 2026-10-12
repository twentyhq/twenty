import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, waitFor, within } from 'storybook/test';

export const sliderRangeTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const priceRange = within(canvas.getByRole('group', { name: 'Price range' }));
  const [minimumThumb, maximumThumb] = priceRange.getAllByRole('slider', {
    hidden: true,
  });

  await waitFor(
    () => {
      expect(minimumThumb).toBeVisible();
      expect(maximumThumb).toBeVisible();
    },
    { timeout: INTERACTION_TIMEOUT },
  );

  expect(minimumThumb).toHaveAttribute('aria-label', 'Minimum price');
  expect(minimumThumb).toHaveValue('20');
  expect(maximumThumb).toHaveAttribute('aria-label', 'Maximum price');
  expect(maximumThumb).toHaveValue('80');
  expect(priceRange.getByRole('status')).toHaveTextContent('20 – 80');
  expect(errorHandler).not.toHaveBeenCalled();
};
