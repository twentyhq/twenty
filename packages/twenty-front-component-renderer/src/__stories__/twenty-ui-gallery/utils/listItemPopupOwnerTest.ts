import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const listItemPopupOwnerTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole('button', { name: 'Preference actions' });

  await userEvent.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

  const item = await page.findByRole('menuitem', {
    name: /^Enable notifications\s*Popup owner$/,
  });
  const disabledItem = page.getByRole('menuitem', {
    name: 'Unavailable notifications',
  });

  await waitFor(() => expect(item).toBeVisible());
  expect(item.tagName).toBe('BUTTON');
  expect(item).toHaveAttribute('data-ref-tag', 'HTML-BUTTON');
  expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(disabledItem);
  expect(canvas.getByLabelText('Popup activations')).toHaveTextContent('0');
  await userEvent.click(item);
  await waitFor(() =>
    expect(canvas.getByLabelText('Popup activations')).toHaveTextContent('1'),
  );
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
};
