import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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

export const createRadioGroupTest =
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
