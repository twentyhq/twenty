import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type SandboxErrorExpectation } from '@/__stories__/twenty-ui-gallery/types/SandboxErrorExpectation';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';
import { expect, userEvent, within } from 'storybook/test';

type CreateRadioGroupTestOptions = {
  optionName: 'Daily' | 'Pro plan';
  activationErrors: SandboxErrorExpectation;
};

export const createRadioGroupTest =
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
