import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const responsiveHooksTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
  args,
}) => {
  const canvas = within(canvasElement);
  await expect(
    await canvas.findByText('Mobile layout: false', {}, { timeout: 10000 }),
  ).toBeVisible();
  await expect(canvas.getByText('Touch input: false')).toBeVisible();
  const save = canvas.getByRole('button', { name: 'Save record' });
  await expect(within(save).getByText('S')).toBeVisible();
  await userEvent.click(save);
  await userEvent.click(canvas.getByRole('button', { name: 'Pointer action' }));
  await waitFor(() => expect(canvas.getByText('Activations: 2')).toBeVisible());
  await expect(args.onError).not.toHaveBeenCalled();
};
