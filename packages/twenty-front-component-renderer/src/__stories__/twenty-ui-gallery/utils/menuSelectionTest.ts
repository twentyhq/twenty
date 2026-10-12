import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const menuSelectionTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Account actions' });
  await userEvent.click(trigger);
  const checkbox = await page.findByRole('menuitemcheckbox', {
    name: 'Notifications',
  });
  await waitFor(() => expect(checkbox).toBeVisible());
  expect(checkbox).toHaveAttribute('aria-checked', 'true');
  await userEvent.click(checkbox);
  await waitFor(() =>
    expect(checkbox).toHaveAttribute('aria-checked', 'false'),
  );
  expect(page.getByLabelText('Checkbox request')).toHaveTextContent(
    'Notifications: unchecked; reason: item-press',
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const protectedCheckbox = page.getByRole('menuitemcheckbox', {
    name: 'Protected preference',
  });
  await userEvent.click(protectedCheckbox);
  await waitFor(() =>
    expect(page.getByLabelText('Cancelled checkbox request')).toHaveTextContent(
      'Protected reason: item-press',
    ),
  );
  expect(protectedCheckbox).toHaveAttribute('aria-checked', 'false');
  const compact = page.getByRole('menuitemradio', { name: 'Compact' });
  const comfortable = page.getByRole('menuitemradio', { name: 'Comfortable' });
  expect(compact).toHaveAttribute('aria-checked', 'true');
  expect(comfortable).toHaveAttribute('aria-checked', 'false');
  await userEvent.click(comfortable);
  await waitFor(() =>
    expect(comfortable).toHaveAttribute('aria-checked', 'true'),
  );
  expect(compact).toHaveAttribute('aria-checked', 'false');
  expect(page.getByLabelText('Radio request')).toHaveTextContent(
    'Density: comfortable; reason: item-press',
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(errorHandler).not.toHaveBeenCalled();
};
