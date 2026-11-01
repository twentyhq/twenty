import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const listItemOwnerTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const user = userEvent.setup();
  const digest = canvas.getByRole('button', {
    name: /^Weekly digest\s*Workspace preference$/,
  });

  expect(digest.tagName).toBe('BUTTON');
  expect(digest).toHaveAttribute('type', 'button');
  expect(digest).toHaveAttribute('data-ref-tag', 'HTML-BUTTON');
  await user.click(digest);
  await waitFor(() =>
    expect(canvas.getByLabelText('Digest state')).toHaveTextContent('enabled'),
  );
  expect(canvas.getByLabelText('Click target')).toHaveTextContent(
    'click:HTML-BUTTON',
  );
  expect(canvas.getByLabelText('Focus target')).toHaveTextContent(
    'HTML-BUTTON',
  );
  expect(digest).toHaveFocus();
  await user.keyboard('{Enter} ');
  await waitFor(() =>
    expect(canvas.getByLabelText('Digest activations')).toHaveTextContent('3'),
  );
  expect(canvas.getByLabelText('Bubbled clicks')).toHaveTextContent('3');
  expect(canvas.getByLabelText('Last key')).toHaveTextContent('Space');

  const disabledPreference = canvas.getByRole('button', {
    name: 'Disabled preference',
  });

  expect(disabledPreference).toBeDisabled();
  await user.click(disabledPreference);
  await user.tab();
  expect(disabledPreference).not.toHaveFocus();
  expect(canvas.getByLabelText('Digest activations')).toHaveTextContent('3');
  expect(canvas.getByLabelText('Bubbled clicks')).toHaveTextContent('3');

  await user.click(canvas.getByRole('button', { name: 'Isolated preference' }));
  await waitFor(() =>
    expect(canvas.getByLabelText('Suppressed clicks')).toHaveTextContent('1'),
  );
  expect(canvas.getByLabelText('Bubbled clicks')).toHaveTextContent('3');

  const link = canvas.getByRole('link', { name: 'Workspace profile' });

  expect(link.tagName).toBe('A');
  expect(link).toHaveAttribute('href', '#list-item-profile');
  expect(link).toHaveAttribute('target', '_self');
  expect(link).toHaveAttribute('data-ref-tag', 'HTML-A');
  expect(link.querySelector('a')).toBeNull();
  await user.click(link);
  await user.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Link activations')).toHaveTextContent('2'),
  );
  expect(link).toHaveFocus();
  await user.keyboard(' ');
  expect(canvas.getByLabelText('Link activations')).toHaveTextContent('2');
};
