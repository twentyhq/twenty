import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { expect, within } from 'storybook/test';

export const expectSliderGalleryMounted = async (
  canvasElement: HTMLElement,
): Promise<HTMLElement> => {
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
  expect(canvas.getByText('Volume: 40; Committed: 40')).toBeVisible();

  return slider;
};
