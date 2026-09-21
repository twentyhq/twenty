import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const pickerListItemsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const alex = canvas.getByRole('option', { name: 'Alex Morgan' });
  const sam = canvas.getByRole('option', { name: 'Sam Taylor' });

  await userEvent.click(alex);
  await waitFor(() => expect(alex).toHaveAttribute('aria-selected', 'true'));
  sam.focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(sam).toHaveAttribute('aria-selected', 'true'));
  expect(alex).toHaveAttribute('aria-selected', 'false');

  const qualified = canvas.getByRole('option', { name: 'Qualified' });
  const indicator = qualified.querySelector('span[aria-hidden="true"]');

  expect(indicator).not.toBeNull();
  await userEvent.click(indicator as HTMLElement);
  await waitFor(() =>
    expect(qualified).toHaveAttribute('aria-selected', 'true'),
  );
  expect(canvas.getByRole('status')).toHaveTextContent('Changes: 1');
  qualified.focus();
  await userEvent.keyboard(' ');
  await waitFor(() =>
    expect(qualified).toHaveAttribute('aria-selected', 'false'),
  );
  expect(canvas.getByRole('status')).toHaveTextContent('Changes: 2');

  await userEvent.click(
    canvas.getByRole('option', { name: 'Unavailable color' }),
  );
  expect(canvas.getByRole('status')).toHaveTextContent('Changes: 2');
  expect(canvas.queryByRole('checkbox')).toBeNull();
  expect(errorHandler).not.toHaveBeenCalled();
};
