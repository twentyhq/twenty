import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const switchTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const emailNotifications = canvas.getByRole('switch', {
    name: 'Email notifications',
  });
  const uncontrolled = canvas.getByRole('switch', {
    name: 'Uncontrolled notifications',
  });
  const disabled = canvas.getByRole('switch', {
    name: 'Disabled notifications',
  });
  expect(emailNotifications).not.toBeChecked();
  expect(uncontrolled).toBeChecked();
  expect(disabled).toHaveAttribute('aria-disabled', 'true');

  await userEvent.click(disabled);
  expect(disabled).not.toBeChecked();
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Notifications: disabled',
  );

  await userEvent.click(emailNotifications);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Notifications: enabled',
    ),
  );
  expect(emailNotifications).toBeChecked();

  await userEvent.click(uncontrolled);
  await waitFor(() => expect(uncontrolled).not.toBeChecked());
  expect(errorHandler).not.toHaveBeenCalled();
};
