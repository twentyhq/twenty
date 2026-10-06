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

  expect(email).toHaveAccessibleDescription('Use your work email');
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
  expect(errorHandler).not.toHaveBeenCalled();
};
