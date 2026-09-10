import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { TYPING_DELAY } from '@/__stories__/shared/test-utils/timeouts';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryStory } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

export const fieldControlsTest =
  (runtime: 'react' | 'preact'): NonNullable<TwentyUiGalleryStory['play']> =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const email = canvas.getByRole('textbox', { name: 'Email' });
    const notes = canvas.getByRole('textbox', { name: 'Notes' });

    expect(email).toHaveAccessibleDescription('Use your work email');
    // React writes boolean ARIA attributes as empty strings on remote elements.
    expect(
      canvas.getByRole('textbox', { name: 'Required name' }),
    ).toHaveAttribute('aria-invalid', runtime === 'react' ? '' : 'true');
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
    // Textarea's render element loses its change handler in the React runtime.
    await waitFor(() =>
      expect(canvas.getByTestId('reported-values')).toHaveTextContent(
        runtime === 'react'
          ? /^Email: alice; Notes:$/
          : 'Email: alice; Notes: Follow up',
      ),
    );
    await expectSandboxErrors([SANDBOX_ERROR_PATTERNS.COMPOSED_PATH]);
  };

export const listItemTest: TwentyUiGalleryStory['play'] = async ({
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
  expect(errorHandler).not.toHaveBeenCalled();
};

export const toastTest: TwentyUiGalleryStory['play'] = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  expect(canvas.getByRole('status')).toHaveTextContent('Account saved');
  expect(
    canvas.getByText('Your changes are available to the team'),
  ).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
  await waitFor(() =>
    expect(
      canvas.getByText('Notification: visible; Action: undone'),
    ).toBeVisible(),
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await waitFor(() =>
    expect(
      canvas.getByText('Notification: visible; Action: cancelled'),
    ).toBeVisible(),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Dismiss notification' }),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('status')).not.toBeInTheDocument(),
  );
  expect(
    canvas.getByText('Notification: closed; Action: cancelled'),
  ).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};
