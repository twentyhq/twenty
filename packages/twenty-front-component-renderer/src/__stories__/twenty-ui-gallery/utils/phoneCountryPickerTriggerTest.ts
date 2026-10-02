import { expect, userEvent, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const phoneCountryPickerTriggerTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const primary = canvas.getByRole('button', {
      name: 'Primary phone country',
    });
    const secondary = canvas.getByRole('button', {
      name: 'Secondary phone country',
    });
    const disabled = canvas.getByRole('button', {
      name: 'Disabled phone country',
    });

    expect(primary).toHaveAttribute('type', 'button');
    expect(primary).toHaveTextContent('🇺🇸');
    expect(secondary).toHaveTextContent('🇫🇷');
    expect(disabled).toBeDisabled();
    await userEvent.click(disabled);
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
    expect(
      canvas.getByRole('status', { name: 'Primary phone country selection' }),
    ).toHaveTextContent('Country: US; Changes: 0');
    expect(
      canvas.getByRole('status', { name: 'Secondary phone country selection' }),
    ).toHaveTextContent('Country: FR; Changes: 0');
    expect(
      canvas.getByRole('status', { name: 'Disabled phone country selection' }),
    ).toHaveTextContent('Country: none; Changes: 0');
    expect(errorHandler).not.toHaveBeenCalled();
  };
