import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import {
  INTERACTION_TIMEOUT,
  TYPING_DELAY,
} from '@/__stories__/shared/test-utils/timeouts';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type SandboxErrorExpectation } from '@/__stories__/twenty-ui-gallery/types/SandboxErrorExpectation';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';

type CreateFieldControlsTestOptions = {
  expectedReportedValues: string | RegExp;
};

export const checkboxTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const checkbox = canvas.getByRole('checkbox', { name: 'Select account' });
  const uncontrolled = canvas.getByRole('checkbox', {
    name: 'Uncontrolled selection',
  });
  expect(checkbox).not.toBeChecked();
  expect(uncontrolled).toBeChecked();
  expect(
    canvas.getByRole('checkbox', { name: 'Partial selection' }),
  ).toBePartiallyChecked();
  const disabled = canvas.getByRole('checkbox', {
    name: 'Disabled selection',
  });
  expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(disabled);
  expect(disabled).not.toBeChecked();

  const readOnly = canvas.getByRole('checkbox', {
    name: 'Read-only selection',
  });
  await userEvent.click(readOnly);
  expect(readOnly).toBeChecked();
  expect(errorHandler).not.toHaveBeenCalled();

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
        expectedReportedValues,
      ),
    );
    await expectSandboxErrors({
      requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
    });
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

// The hidden thumbs have no accessible name, so the sliders are matched by
// their aria-label attribute instead of a name filter.
export const sliderRangeTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const priceRange = within(canvas.getByRole('group', { name: 'Price range' }));
  const [minimumThumb, maximumThumb] = priceRange.getAllByRole('slider', {
    hidden: true,
  });

  expect(minimumThumb).toHaveAttribute('aria-label', 'Minimum price');
  expect(minimumThumb).toHaveValue('20');
  expect(maximumThumb).toHaveAttribute('aria-label', 'Maximum price');
  expect(maximumThumb).toHaveValue('80');
  expect(priceRange.getByRole('status')).toHaveTextContent('20 – 80');
  expect(errorHandler).not.toHaveBeenCalled();
};

type CreateRadioGroupTestOptions = {
  optionName: 'Daily' | 'Pro plan';
  activationErrors: SandboxErrorExpectation;
};

const RADIO_ACTIVATION_ERRORS: SandboxErrorExpectation = {
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
  allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
};

const createRadioGroupTest =
  ({
    optionName,
    activationErrors,
  }: CreateRadioGroupTestOptions): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);
    expect(canvas.getByRole('radio', { name: 'Weekly' })).toBeChecked();
    const disabled = canvas.getByRole('radio', { name: 'Monthly' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(disabled);
    expect(disabled).not.toBeChecked();
    expect(canvas.getByRole('radio', { name: 'Basic plan' })).toBeChecked();

    await userEvent.click(canvas.getByRole('radio', { name: optionName }));
    await expectSandboxErrors(activationErrors);

    expect(canvas.getByText('Frequency: weekly')).toBeVisible();
    expect(canvas.getByText('Plan: basic')).toBeVisible();
  };

export const radioGroupTest = createRadioGroupTest({
  optionName: 'Daily',
  activationErrors: RADIO_ACTIVATION_ERRORS,
});

export const cardPickerTest = createRadioGroupTest({
  optionName: 'Pro plan',
  activationErrors: RADIO_ACTIVATION_ERRORS,
});

// React drops the click handler Base UI adds through cloneElement, so only
// the group's focus handling reports the missing nativeEvent.
export const cardPickerDroppedClickTest = createRadioGroupTest({
  optionName: 'Pro plan',
  activationErrors: {
    requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
  },
});
