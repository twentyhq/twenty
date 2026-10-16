import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import {
  INTERACTION_TIMEOUT,
  TYPING_DELAY,
} from '@/__stories__/shared/test-utils/timeouts';
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
  const shortNotesHeight = notes.getBoundingClientRect().height;
  await userEvent.click(canvas.getByRole('button', { name: 'Apply notes' }));
  await waitFor(() => expect(notes).toHaveValue('First\nSecond\nThird'));
  await waitFor(
    () =>
      expect(notes.getBoundingClientRect().height).toBeGreaterThan(
        shortNotesHeight,
      ),
    { timeout: INTERACTION_TIMEOUT },
  );
  const longNotesHeight = notes.getBoundingClientRect().height;
  await userEvent.click(canvas.getByRole('button', { name: 'Clear notes' }));
  await waitFor(() => expect(notes).toHaveValue(''));
  await waitFor(
    () =>
      expect(notes.getBoundingClientRect().height).toBeLessThan(
        longNotesHeight,
      ),
    { timeout: INTERACTION_TIMEOUT },
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Apply wrapping notes' }),
  );
  await waitFor(() =>
    expect(notes).toHaveValue(
      'Keep the team informed about the next meeting and share all follow up actions before the end of the week.',
    ),
  );
  await waitFor(() => expect(notes.scrollHeight).toBe(notes.clientHeight), {
    timeout: INTERACTION_TIMEOUT,
  });
  const wideNotesHeight = notes.getBoundingClientRect().height;
  await userEvent.click(canvas.getByRole('button', { name: 'Narrow notes' }));
  await waitFor(() => expect(getComputedStyle(notes).width).toBe('140px'), {
    timeout: INTERACTION_TIMEOUT,
  });
  await waitFor(() => expect(notes.scrollHeight).toBe(notes.clientHeight), {
    timeout: INTERACTION_TIMEOUT,
  });
  await waitFor(
    () =>
      expect(notes.getBoundingClientRect().height).toBeGreaterThan(
        wideNotesHeight,
      ),
    { timeout: INTERACTION_TIMEOUT },
  );
  const narrowNotesHeight = notes.getBoundingClientRect().height;
  await userEvent.click(canvas.getByRole('button', { name: 'Widen notes' }));
  await waitFor(
    () =>
      expect(notes.getBoundingClientRect().height).toBeLessThan(
        narrowNotesHeight,
      ),
    { timeout: INTERACTION_TIMEOUT },
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
