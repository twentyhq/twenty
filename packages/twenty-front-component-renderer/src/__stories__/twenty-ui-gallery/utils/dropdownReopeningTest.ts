import { expect, userEvent } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createDropdownTestContext } from '@/__stories__/twenty-ui-gallery/utils/createDropdownTestContext';

export const dropdownReopeningTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const { canvas, page, trigger, openMenu, expectMenuClosed } =
    await createDropdownTestContext(canvasElement);

  await openMenu();
  await userEvent.click(page.getByRole('menuitem', { name: 'Select record' }));
  await expectMenuClosed();
  expect(canvas.getByRole('status', { name: 'Selections' })).toHaveTextContent(
    'Selections: 1',
  );

  await openMenu();
  await userEvent.click(page.getByRole('menuitem', { name: 'Keep menu open' }));
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(trigger);
  await expectMenuClosed();

  await openMenu();
  await userEvent.keyboard('{Escape}');
  await expectMenuClosed();

  await openMenu();
  await userEvent.click(canvas.getByRole('status', { name: 'Selections' }));
  await expectMenuClosed();

  await openMenu();
  await userEvent.click(page.getByRole('menuitem', { name: 'Select record' }));
  await expectMenuClosed();
  expect(canvas.getByRole('status', { name: 'Selections' })).toHaveTextContent(
    'Selections: 2',
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
