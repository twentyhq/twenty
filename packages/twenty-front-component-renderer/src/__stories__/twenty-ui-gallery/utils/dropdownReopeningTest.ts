import { expect, userEvent, waitFor } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
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

  const hostAction = canvas.getByRole('button', { name: 'Host action' });
  const forwardedPresses = canvas.getByRole('status', {
    name: 'Forwarded presses',
  });

  await openMenu();
  await userEvent.click(hostAction);
  await expectMenuClosed();
  await waitFor(
    () => expect(forwardedPresses).toHaveTextContent('Forwarded presses: 1'),
    { timeout: INTERACTION_TIMEOUT },
  );

  await userEvent.click(hostAction);
  await userEvent.click(canvas.getByRole('button', { name: 'Outside menu' }));
  await waitFor(
    () =>
      expect(
        canvas.getByRole('status', { name: 'Outside actions' }),
      ).toHaveTextContent('Outside actions: 1'),
    { timeout: INTERACTION_TIMEOUT },
  );
  expect(forwardedPresses).toHaveTextContent('Forwarded presses: 1');
  expect(errorHandler).not.toHaveBeenCalled();
};
