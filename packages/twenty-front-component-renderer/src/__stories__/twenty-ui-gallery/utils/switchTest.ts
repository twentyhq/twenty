import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const switchTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const emailNotificationsSwitch = canvas.getByRole('switch', {
    name: 'Email notifications',
  });
  const uncontrolledSwitch = canvas.getByRole('switch', {
    name: 'Uncontrolled notifications',
  });
  const disabledSwitch = canvas.getByRole('switch', {
    name: 'Disabled notifications',
  });
  expect(emailNotificationsSwitch).not.toBeChecked();
  expect(uncontrolledSwitch).toBeChecked();
  expect(disabledSwitch).toHaveAttribute('aria-disabled', 'true');

  await userEvent.click(disabledSwitch);
  expect(disabledSwitch).not.toBeChecked();
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Notifications: disabled',
  );

  await userEvent.click(emailNotificationsSwitch);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Notifications: enabled',
    ),
  );
  expect(emailNotificationsSwitch).toBeChecked();

  await userEvent.click(uncontrolledSwitch);
  await waitFor(() => expect(uncontrolledSwitch).not.toBeChecked());
  expect(errorHandler).not.toHaveBeenCalled();
};
