import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';
import { expect, userEvent, waitFor, within } from 'storybook/test';

export const navigationControlsTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);

  const canvas = within(context.canvasElement);
  const suggestion = canvas.getByRole('button', { name: 'Suggestion' });
  await expect(suggestion).toHaveAttribute('data-selected');
  await userEvent.click(suggestion);
  suggestion.focus();
  await userEvent.keyboard('{Enter} ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Suggestion activations')).toHaveTextContent(
      '3',
    ),
  );

  const picker = canvas.getByRole('button', { name: 'Picker' });
  await expect(picker).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(picker);
  await waitFor(() => expect(picker).toHaveAttribute('aria-pressed', 'true'));
  picker.focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(picker).toHaveAttribute('aria-pressed', 'false'));
  await userEvent.keyboard(' ');
  await waitFor(() => {
    expect(picker).toHaveAttribute('aria-pressed', 'true');
    expect(canvas.getByLabelText('Picker activations')).toHaveTextContent('3');
  });

  const disabledPicker = canvas.getByRole('button', {
    name: 'Disabled picker',
  });
  await expect(disabledPicker).toBeDisabled();
  await userEvent.click(disabledPicker);
  await waitFor(() =>
    expect(canvas.getByLabelText('Picker activations')).toHaveTextContent('3'),
  );
};
