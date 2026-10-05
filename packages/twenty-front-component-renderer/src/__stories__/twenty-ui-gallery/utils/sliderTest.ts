import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, waitFor, within } from 'storybook/test';

export const sliderTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const volume = within(canvas.getByRole('group', { name: 'Volume' }));
  const slider = volume.getByRole('slider', { hidden: true });
  expect(volume.getByRole('status')).toHaveTextContent('40');
  expect(slider).toHaveValue('40');
  const disabledVolume = within(
    canvas.getByRole('group', { name: 'Disabled volume' }),
  );
  expect(disabledVolume.getByRole('slider', { hidden: true })).toBeDisabled();
  await expect(
    waitFor(() => expect(slider).toBeVisible(), {
      timeout: INTERACTION_TIMEOUT,
    }),
  ).rejects.toThrow();
  expect(canvas.getByText('Volume: 40; Committed: 40')).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};
