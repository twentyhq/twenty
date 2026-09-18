import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const listItemTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const digest = canvas.getByText('Weekly digest');

  await userEvent.click(digest);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Digest: enabled'),
  );
  await userEvent.click(digest);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Digest: disabled'),
  );
  await userEvent.click(canvas.getByText('Disabled preference'));
  expect(canvas.getByRole('status')).toHaveTextContent('Digest: disabled');
  await userEvent.click(canvas.getByText('Disabled notifications'));
  await userEvent.click(
    canvas.getByRole('switch', { name: 'Disabled notifications' }),
  );
  expect(canvas.getByText('Notifications: disabled; Changes: 0')).toBeVisible();

  const hiddenFields = canvas.getByRole('button', { name: 'Hidden fields' });
  await userEvent.click(hiddenFields);
  await waitFor(() => expect(canvas.getByText('Fields: open')).toBeVisible());
  expect(errorHandler).not.toHaveBeenCalled();
};
