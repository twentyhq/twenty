import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const menuSubmenuTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Account actions' });
  await userEvent.click(trigger);
  const submenuTrigger = await page.findByRole('menuitem', { name: 'Export' });
  await waitFor(() => expect(submenuTrigger).toBeVisible());
  await userEvent.hover(submenuTrigger);
  const item = await page.findByRole('menuitem', { name: 'Export PDF' });
  await waitFor(() => expect(item).toBeVisible());
  expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(item);
  await waitFor(() =>
    expect(canvas.getByLabelText('Menu action')).toHaveTextContent(
      'Action: exported',
    ),
  );
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
