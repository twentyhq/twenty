import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import {
  INTERACTION_TIMEOUT,
  TYPING_DELAY,
} from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

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
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Selection: selected; Changes: 1',
    ),
  );
  expect(checkbox).toBeChecked();

  await userEvent.click(uncontrolled);
  await waitFor(() => expect(uncontrolled).not.toBeChecked());
  expect(errorHandler).not.toHaveBeenCalled();
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

const RADIO_GROUP_STATUSES_BY_OPTION_NAME = {
  Daily: {
    initiallyCheckedOptionName: 'Weekly',
    initialStatus: 'Frequency: weekly',
    activatedStatus: 'Frequency: daily',
  },
  'Pro plan': {
    initiallyCheckedOptionName: 'Basic plan',
    initialStatus: 'Plan: basic',
    activatedStatus: 'Plan: pro',
  },
};

type CreateRadioGroupTestOptions = {
  optionName: keyof typeof RADIO_GROUP_STATUSES_BY_OPTION_NAME;
  clickActivatesOption: boolean;
};

const createRadioGroupTest =
  ({
    optionName,
    clickActivatesOption,
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

    const { initiallyCheckedOptionName, initialStatus, activatedStatus } =
      RADIO_GROUP_STATUSES_BY_OPTION_NAME[optionName];
    const option = canvas.getByRole('radio', { name: optionName });
    const initiallyCheckedOption = canvas.getByRole('radio', {
      name: initiallyCheckedOptionName,
    });

    await userEvent.click(option);

    if (clickActivatesOption) {
      await waitFor(() =>
        expect(canvas.getByText(activatedStatus)).toBeVisible(),
      );
      expect(option).toBeChecked();
      expect(initiallyCheckedOption).not.toBeChecked();
      expect(errorHandler).not.toHaveBeenCalled();
      return;
    }

    await expect(
      waitFor(() => expect(canvas.getByText(activatedStatus)).toBeVisible(), {
        timeout: INTERACTION_TIMEOUT,
      }),
    ).rejects.toThrow();
    expect(canvas.getByText(initialStatus)).toBeVisible();
    expect(initiallyCheckedOption).toBeChecked();
    expect(errorHandler).not.toHaveBeenCalled();
  };

export const radioGroupTest = createRadioGroupTest({
  optionName: 'Daily',
  clickActivatesOption: true,
});

export const cardPickerTest = createRadioGroupTest({
  optionName: 'Pro plan',
  clickActivatesOption: true,
});

// React drops the click handler Base UI adds through cloneElement.
export const cardPickerDroppedClickTest = createRadioGroupTest({
  optionName: 'Pro plan',
  clickActivatesOption: false,
});
