import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RESPONSIVE_HOOKS_WIDGET_SIZING } from '@/__stories__/twenty-ui-gallery/constants/RESPONSIVE_HOOKS_WIDGET_SIZING';
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

  canvas.getByTestId(
    RESPONSIVE_HOOKS_WIDGET_SIZING.containerTestId,
  ).style.width = `${RESPONSIVE_HOOKS_WIDGET_SIZING.mobileWidth}px`;

  await expect(
    await canvas.findByText('Mobile layout: true', {}, { timeout: 10000 }),
  ).toBeVisible();
  await expect(canvas.getByText('Touch input: false')).toBeVisible();
  await expect(
    within(canvas.getByRole('button', { name: 'Save record' })).queryByText(
      'S',
    ),
  ).not.toBeInTheDocument();
  await expect(args.onError).not.toHaveBeenCalled();
};
