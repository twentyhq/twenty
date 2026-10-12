import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { TYPING_DELAY } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, userEvent, waitFor, within } from 'storybook/test';

export const fieldControlsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const email = canvas.getByRole('textbox', { name: 'Email' });
  const notes = canvas.getByRole('textbox', { name: 'Notes' });
  const important = canvas.getByRole('radio', { name: 'Important updates' });
  const all = canvas.getByRole('radio', { name: 'All updates' });

  expect(
    canvas.getByRole('radiogroup', { name: 'Notifications' }),
  ).toBeVisible();
  expect(important).toHaveAccessibleDescription('Only urgent messages');
  expect(all).toHaveAccessibleDescription('Every record change');
  expect(canvas.getByRole('radio', { name: 'Daily digest' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  expect(important).toBeChecked();
  await userEvent.click(canvas.getByText('All updates', { exact: true }));
  await waitFor(() => expect(all).toBeChecked());
  expect(important).not.toBeChecked();

  expect(email).toHaveAccessibleDescription('Use your work email');
  expect(notes).toHaveAccessibleDescription(
    'Additional guidance Team context Notes need review',
  );
  expect(
    canvas.getByRole('textbox', { name: 'Required name' }),
  ).toHaveAttribute('aria-invalid', 'true');
  expect(canvas.getByText('Name is required')).toBeVisible();
  expect(canvas.getByRole('textbox', { name: 'Reference' })).toHaveValue(
    'REF-42',
  );
  expect(canvas.getByText('Keep this reference')).toBeVisible();
  expect(canvas.getByText('Reference cannot be changed')).toBeVisible();
  expect(
    canvas.getByRole('textbox', { name: 'Disabled input' }),
  ).toBeDisabled();

  await userEvent.click(canvas.getByText('Email', { exact: true }));
  await waitFor(() => expect(email).toHaveFocus());
  await userEvent.type(email, 'alice', { delay: TYPING_DELAY });
  await userEvent.type(notes, 'Follow up', { delay: TYPING_DELAY });
  await userEvent.click(canvas.getByRole('button', { name: 'Read values' }));
  await waitFor(() =>
    expect(canvas.getByTestId('reported-values')).toHaveTextContent(
      'Email: alice; Notes: Follow up',
    ),
  );
  expect(canvas.getByTestId('native-target')).toHaveTextContent('TEXTAREA');
  expect(canvas.getByTestId('control-values')).toHaveTextContent(
    'alice/Follow up',
  );
  expect(notes.tagName).toBe('TEXTAREA');
  expect(notes).toHaveAttribute('data-filled');
  await userEvent.click(canvas.getByRole('button', { name: 'Apply notes' }));
  await waitFor(() => expect(notes).toHaveValue('First\nSecond\nThird'));
  await userEvent.click(canvas.getByRole('button', { name: 'Clear notes' }));
  await waitFor(() => expect(notes).toHaveValue(''));
  expect(errorHandler).not.toHaveBeenCalled();
};
