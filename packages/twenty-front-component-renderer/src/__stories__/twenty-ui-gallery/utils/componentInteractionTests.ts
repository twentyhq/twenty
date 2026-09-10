import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import {
  INTERACTION_TIMEOUT,
  TYPING_DELAY,
} from '@/__stories__/shared/test-utils/timeouts';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

type CreateFieldControlsTestOptions = {
  expectedAriaInvalid: '' | 'true';
  expectedReportedValues: string | RegExp;
};

// React serializes true boolean ARIA attributes as empty strings in the sandbox.
type CreateCheckboxTestOptions = {
  expectedAriaTrue: '' | 'true';
};

export const createCheckboxTest =
  ({
    expectedAriaTrue,
  }: CreateCheckboxTestOptions): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const checkbox = canvas.getByRole('checkbox', { name: 'Select account' });
    const uncontrolled = canvas.getByRole('checkbox', {
      name: 'Uncontrolled selection',
    });
    expect(checkbox).not.toBeChecked();
    expect(uncontrolled).toHaveAttribute('aria-checked', expectedAriaTrue);
    expect(
      canvas.getByRole('checkbox', { name: 'Partial selection' }),
    ).toBePartiallyChecked();
    const disabled = canvas.getByRole('checkbox', {
      name: 'Disabled selection',
    });
    expect(disabled).toHaveAttribute('aria-disabled', expectedAriaTrue);
    await userEvent.click(disabled);
    expect(disabled).not.toBeChecked();

    const readOnly = canvas.getByRole('checkbox', {
      name: 'Read-only selection',
    });
    await userEvent.click(readOnly);
    expect(readOnly).toHaveAttribute('aria-checked', expectedAriaTrue);
    expect(errorHandler).not.toHaveBeenCalled();

    // Checkbox activation forwards a click through an unavailable PointerEvent.
    await userEvent.click(checkbox);
    await expectSandboxErrors({
      requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
    });
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Selection: unselected; Changes: 0',
    );
  };

export const createFieldControlsTest =
  ({
    expectedAriaInvalid,
    expectedReportedValues,
  }: CreateFieldControlsTestOptions): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const email = canvas.getByRole('textbox', { name: 'Email' });
    const notes = canvas.getByRole('textbox', { name: 'Notes' });

    expect(email).toHaveAccessibleDescription('Use your work email');
    expect(
      canvas.getByRole('textbox', { name: 'Required name' }),
    ).toHaveAttribute('aria-invalid', expectedAriaInvalid);
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
        expectedReportedValues,
      ),
    );
    await expectSandboxErrors({
      requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
    });
  };

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
  expect(errorHandler).not.toHaveBeenCalled();
};

export const toastTest: TwentyUiGalleryPlayFunction = async ({
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

// Slider's synchronous layout measurements leave its thumbs hidden in the sandbox.
export const sliderTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const volume = within(canvas.getByRole('group', { name: 'Volume' }));
  const slider = volume.getByRole('slider', { hidden: true });
  expect(volume.getByRole('status')).toHaveTextContent('40');
  expect(slider).toHaveValue('40');
  const disabledVolume = within(
    canvas.getByRole('group', { name: 'Disabled volume' }),
  );
  expect(disabledVolume.getByRole('slider', { hidden: true })).toBeDisabled();
  await expect(
    waitFor(() => expect(slider).toBeVisible(), {
      timeout: INTERACTION_TIMEOUT,
    }),
  ).rejects.toThrow();
  expect(canvas.getByText('Volume: 40; Committed: 40')).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};

type CreateRadioGroupPreactTestOptions = {
  optionName: 'Daily' | 'Pro plan';
};

export const createRadioGroupPreactTest =
  ({
    optionName,
  }: CreateRadioGroupPreactTestOptions): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);
    expect(canvas.getByRole('radio', { name: 'Weekly' })).toBeChecked();
    const disabled = canvas.getByRole('radio', { name: 'Monthly' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(disabled);
    expect(disabled).not.toBeChecked();
    expect(canvas.getByRole('radio', { name: 'Basic plan' })).toBeChecked();

    // Preact can report ordering and forwarded-event errors before PointerEvent fails.
    await userEvent.click(canvas.getByRole('radio', { name: optionName }));
    await expectSandboxErrors({
      requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
      allowedAdditionalErrors: [
        SANDBOX_ERROR_PATTERNS.DOCUMENT_POSITION,
        SANDBOX_ERROR_PATTERNS.COMPOSED_PATH,
      ],
    });
    expect(canvas.getByText('Frequency: weekly')).toBeVisible();
    expect(canvas.getByText('Plan: basic')).toBeVisible();
  };
