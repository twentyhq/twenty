import { expect, userEvent, waitFor, within } from 'storybook/test';
import { getUserDevice } from 'twenty-ui/utilities';

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
  const hostDevice = getUserDevice();
  await expect(hostDevice).not.toBe('unknown');
  const expectedShortcut =
    hostDevice === 'mac' || hostDevice === 'ios' ? '⌘S' : 'Ctrl S';
  await expect(canvas.getByText(`Device: ${hostDevice}`)).toBeVisible();
  await expect(canvas.getByText(`Shortcut: ${expectedShortcut}`)).toBeVisible();
  const save = canvas.getByRole('button', { name: 'Save record' });
  await expect(within(save).getByText(expectedShortcut)).toBeVisible();
  await userEvent.click(save);
  await userEvent.click(canvas.getByRole('button', { name: 'Pointer action' }));
  await waitFor(() => expect(canvas.getByText('Activations: 2')).toBeVisible());
  await expect(args.onError).not.toHaveBeenCalled();
};
