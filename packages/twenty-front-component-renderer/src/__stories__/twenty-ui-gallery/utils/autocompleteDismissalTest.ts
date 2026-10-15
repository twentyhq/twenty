import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const autocompleteDismissalTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByLabelText<HTMLInputElement>('Account owner');
  const trigger = canvas.getByRole('button', { name: 'Show people' });
  const callbacks = canvas.getByRole('status', { name: 'Owner callbacks' });
  const selection = canvas.getByRole('status', { name: 'Owner selection' });

  await userEvent.click(trigger);
  await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  await waitFor(() =>
    expect(
      page.getByRole('region', { name: 'People suggestions' }),
    ).toBeVisible(),
  );
  await userEvent.click(input);
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(callbacks).toHaveTextContent('/keyboard'));
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(callbacks).toHaveTextContent('Open: escape-key/canceled:true'),
  );
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(selection).toHaveTextContent('none; Selections: 0');

  await userEvent.click(page.getByRole('button', { name: 'Allow Escape' }));
  await userEvent.click(input);
  await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await expect(callbacks).toHaveTextContent('Open: escape-key/keydown');
  await expect(selection).toHaveTextContent('none; Selections: 0');
  await expect(input).toHaveFocus();
  await expect(errorHandler).not.toHaveBeenCalled();
};
