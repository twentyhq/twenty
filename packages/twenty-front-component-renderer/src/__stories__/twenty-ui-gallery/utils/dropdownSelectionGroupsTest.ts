import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';

export const dropdownSelectionGroupsTest = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Edit preferences' });
  await userEvent.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  const email = await page.findByRole('option', { name: 'Email alerts' });
  const sms = page.getByRole('option', { name: 'SMS alerts' });
  const blocked = page.getByRole('option', { name: 'Blocked alerts' });
  const compact = page.getByRole('option', { name: 'Compact layout' });
  const spacious = page.getByRole('option', { name: 'Spacious layout' });
  const notes = page.getByRole('option', { name: 'Notes' });
  const tasks = page.getByRole('option', { name: 'Tasks' });
  const clear = page.getByRole('button', { name: 'Clear channels' });
  expect(page.getByRole('listbox', { name: 'Channels' })).toHaveAttribute(
    'aria-multiselectable',
    'true',
  );
  expect(page.getByRole('listbox', { name: 'Density' })).toHaveAttribute(
    'aria-multiselectable',
    'false',
  );
  expect(email).toHaveAttribute('aria-selected', 'false');
  expect(email).toHaveAttribute('data-composed-selected', 'false');
  expect(email).toHaveAttribute('data-composed-multiple', 'true');
  expect(compact).toHaveAttribute('aria-selected', 'false');
  expect(notes).toHaveAttribute('aria-selected', 'false');
  await waitFor(() => expect(email).toHaveFocus());
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(sms).toHaveFocus());
  expect(sms).toHaveAttribute('aria-selected', 'false');
  expect(canvas.getByLabelText('Channel callback')).toHaveTextContent(
    'pending',
  );
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(blocked).toHaveFocus());
  await userEvent.keyboard(' ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Channel callback')).toHaveTextContent(
      /^Canceled: .+\/.+\/true$/,
    ),
  );
  expect(blocked).toHaveAttribute('aria-selected', 'false');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(compact).toHaveFocus());
  await userEvent.keyboard(' ');
  await waitFor(() => expect(compact).toHaveAttribute('aria-selected', 'true'));
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(canvas.getByLabelText('Channels selection')).toHaveTextContent(
    'Channels: none',
  );
  await userEvent.keyboard('{Home}');
  await waitFor(() => expect(email).toHaveFocus());
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(email).toHaveAttribute('aria-selected', 'true'));
  expect(email).toHaveAttribute('data-composed-selected', 'true');
  expect(compact).toHaveAttribute('aria-selected', 'true');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(canvas.getByLabelText('Channel callback')).toHaveTextContent(
    /^Accepted: .+\/.+\/false$/,
  );
  await userEvent.keyboard('{End}');
  await waitFor(() => expect(clear).toHaveFocus());
  expect(tasks).toHaveAttribute('aria-selected', 'false');
  await userEvent.click(notes);
  await waitFor(() => expect(notes).toHaveAttribute('aria-selected', 'true'));
  await userEvent.click(notes);
  await waitFor(() => expect(notes).toHaveAttribute('aria-selected', 'false'));
  await userEvent.click(tasks);
  await waitFor(() => expect(tasks).toHaveAttribute('aria-selected', 'true'));
  await userEvent.click(spacious);
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await userEvent.click(trigger);
  const reopenedEmail = await page.findByRole('option', {
    name: 'Email alerts',
  });
  expect(reopenedEmail).toHaveAttribute('aria-selected', 'true');
  expect(page.getByRole('option', { name: 'Compact layout' })).toHaveAttribute(
    'aria-selected',
    'false',
  );
  expect(page.getByRole('option', { name: 'Spacious layout' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(page.getByRole('option', { name: 'Tasks' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await userEvent.click(page.getByRole('option', { name: 'SMS alerts' }));
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(canvas.getByLabelText('Channels selection')).toHaveTextContent(
    'Channels: email, sms',
  );
  await userEvent.click(trigger);
  await userEvent.click(
    await page.findByRole('button', { name: 'Clear channels' }),
  );
  await waitFor(() =>
    expect(canvas.getByLabelText('Channels selection')).toHaveTextContent(
      'Channels: none',
    ),
  );
  expect(page.getByRole('option', { name: 'Email alerts' })).toHaveAttribute(
    'data-composed-selected',
    'false',
  );
  expect(page.getByRole('option', { name: 'Spacious layout' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(page.getByRole('option', { name: 'Tasks' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
