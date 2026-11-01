import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const settingsRowTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const notifications = canvas.getByRole('switch', { name: 'Notifications' });
  const label = canvas.getByTestId('notifications-row');
  const input = label.querySelector('input[type="checkbox"]');
  const disabled = canvas.getByRole('switch', {
    name: 'Disabled notifications',
  });
  const uncontrolled = canvas.getByRole('switch', {
    name: 'Uncontrolled notifications',
  });
  const readOnly = canvas.getByRole('switch', {
    name: 'Read-only notifications',
  });
  const cancelled = canvas.getByRole('switch', {
    name: 'Cancelled notifications',
  });

  await expect(notifications).toHaveAccessibleDescription('Updates by email');
  expect(canvas.getByTestId('notifications-start')).toHaveTextContent('Email');
  expect(label.tagName).toBe('LABEL');
  expect(label).toHaveAttribute('for', 'notifications-control');
  expect(label).toHaveAttribute('title', 'Native label');
  expect(label).toHaveAttribute('data-ref-target', 'label');
  expect(label).toHaveAttribute('data-label-render', 'true');
  expect(notifications).toHaveAttribute('title', 'Switch control');
  expect(notifications).toHaveAttribute('data-ref-target', 'control');
  expect(notifications).toHaveAttribute('data-active', 'false');
  expect(notifications).toHaveAttribute('id', 'notifications-control');
  expect(input).toHaveAttribute('data-ref-target', 'input');
  expect(input).toHaveAttribute('name', 'notifications');
  expect(input).toHaveAttribute('value', 'enabled');
  expect(uncontrolled).toBeChecked();
  expect(readOnly).toBeChecked();
  expect(disabled).toHaveAttribute('aria-disabled', 'true');

  await userEvent.click(canvas.getByText('Disabled notifications'));
  await userEvent.click(disabled);
  await userEvent.click(canvas.getByText('Read-only notifications'));
  await userEvent.click(readOnly);
  expect(disabled).not.toBeChecked();
  expect(readOnly).toBeChecked();
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Notifications: disabled; Changes: 0',
  );

  await userEvent.click(canvas.getByText('Notifications'));
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Notifications: enabled; Changes: 1',
    ),
  );
  expect(notifications).toBeChecked();
  expect(notifications).toHaveAttribute('data-active', 'true');
  expect(canvas.getByRole('status')).toHaveTextContent(
    /Event: (click|change)\/function/,
  );
  expect(canvas.getByLabelText('Native label event')).toHaveTextContent(
    'LABEL/click',
  );
  expect(canvas.getByLabelText('Switch control event')).toHaveTextContent(
    'BUTTON/click',
  );

  await userEvent.click(notifications);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Notifications: disabled; Changes: 2',
    ),
  );
  expect(canvas.getByLabelText('Switch control event')).toHaveTextContent(
    'BUTTON/click',
  );
  notifications.focus();
  await userEvent.keyboard(' ');
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Notifications: enabled; Changes: 3',
    ),
  );
  expect(notifications).toBeChecked();

  await userEvent.click(canvas.getByText('Uncontrolled notifications'));
  await waitFor(() => expect(uncontrolled).not.toBeChecked());
  await userEvent.click(canvas.getByText('Cancelled notifications'));
  await waitFor(() =>
    expect(canvas.getByLabelText('Cancelled changes')).toHaveTextContent(
      /^1\/(click|change)$/,
    ),
  );
  expect(cancelled).not.toBeChecked();
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Notifications: enabled; Changes: 3',
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
