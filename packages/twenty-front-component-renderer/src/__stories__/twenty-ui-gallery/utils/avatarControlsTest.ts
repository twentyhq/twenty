import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const avatarControlsTest: TwentyUiGalleryPlayFunction = async (
  context,
) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);
  const imageEntry = within(canvas.getByTestId('gallery-item-AvatarImage'));

  const labelledFallback = imageEntry.getByRole('img', {
    name: 'Portrait unavailable',
  });
  const decorativeFallback = canvas.getByText('A');

  await expect(labelledFallback).toHaveTextContent('I');
  await expect(labelledFallback).toBeVisible();
  await expect(decorativeFallback).toBeVisible();
  await expect(decorativeFallback).toHaveAttribute('aria-hidden', 'true');
  await expect(
    canvas.queryByRole('img', { name: 'Acme' }),
  ).not.toBeInTheDocument();

  const button = canvas.getByRole('button', { name: 'Open Jane' });
  const activations = canvas.getByLabelText('Activations');

  await expect(button.tagName).toBe('BUTTON');
  await expect(button).toHaveAttribute('type', 'button');
  await expect(button).toHaveAttribute('data-ref-tag', 'HTML-BUTTON');
  await userEvent.click(button);
  await userEvent.keyboard('{Enter} ');
  await waitFor(() => expect(activations).toHaveTextContent('3'));
  await expect(button).toHaveFocus();

  const disabledButton = canvas.getByRole('button', {
    name: 'Disabled avatar',
  });

  await expect(disabledButton).toBeDisabled();
  await userEvent.click(disabledButton);
  await userEvent.tab();
  await expect(disabledButton).not.toHaveFocus();
  await expect(activations).toHaveTextContent('3');

  const link = canvas.getByRole('link', { name: 'View Jane profile' });
  const fallback = within(link).getByText('Profile');

  await expect(link.tagName).toBe('A');
  await expect(link).toHaveAttribute('href', '#avatar-profile');
  await expect(link).toHaveAttribute('target', '_self');
  await expect(link).toHaveAttribute('data-ref-tag', 'HTML-A');
  await expect(fallback.tagName).toBe('STRONG');
  await expect(fallback).toHaveAttribute('data-ref-tag', 'HTML-STRONG');
  await userEvent.click(link);
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Link activations')).toHaveTextContent('2'),
  );
  await expect(link).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(canvas.getByLabelText('Link activations')).toHaveTextContent(
    '2',
  );

  const presentationalAvatar = canvas.getByTestId('presentational-avatar');

  await expect(presentationalAvatar.tagName).toBe('SPAN');
  await expect(presentationalAvatar).toHaveAttribute(
    'data-ref-tag',
    'HTML-SPAN',
  );
  await expect(presentationalAvatar).not.toHaveAttribute('role');
  await expect(presentationalAvatar).not.toHaveAttribute('tabindex');
  await expect(presentationalAvatar).not.toHaveAttribute('aria-label');
  await userEvent.click(presentationalAvatar);
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Presentational activations'),
    ).toHaveTextContent('1'),
  );
  await expect(presentationalAvatar).not.toHaveFocus();
};
