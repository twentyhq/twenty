import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, userEvent, waitFor, within } from 'storybook/test';

type CreateRadioGroupTestOptions = {
  optionName: string;
  initiallyCheckedOptionName: string;
  activatedStatus: string;
};

export const createRadioGroupTest =
  ({
    optionName,
    initiallyCheckedOptionName,
    activatedStatus,
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

    const option = canvas.getByRole('radio', { name: optionName });
    const initiallyCheckedOption = canvas.getByRole('radio', {
      name: initiallyCheckedOptionName,
    });

    await userEvent.click(option);

    await waitFor(() =>
      expect(canvas.getByText(activatedStatus)).toBeVisible(),
    );
    expect(option).toBeChecked();
    expect(initiallyCheckedOption).not.toBeChecked();
    expect(errorHandler).not.toHaveBeenCalled();
  };
