import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const menuKeyboardTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Account actions' });
  await userEvent.click(trigger);
  await userEvent.keyboard('{ArrowDown}');
  const duplicate = await page.findByRole('menuitem', { name: /^Duplicate/ });
  await waitFor(() => expect(duplicate).toHaveFocus());
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(page.getByRole('menuitem', { name: 'Archive' })).toHaveFocus(),
  );
  await userEvent.keyboard('{Enter}');
  expect(canvas.getByLabelText('Menu action')).toHaveTextContent(
    'Action: none',
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(
      page.getByRole('menuitemcheckbox', { name: 'Notifications' }),
    ).toHaveFocus(),
  );
  await userEvent.keyboard('{End}');
  await waitFor(() =>
    expect(page.getByRole('menuitem', { name: 'Account link' })).toHaveFocus(),
  );
  await userEvent.keyboard('{Home}');
  await waitFor(() => expect(duplicate).toHaveFocus());
  await userEvent.keyboard('Comfort');
  await waitFor(() =>
    expect(
      page.getByRole('menuitemradio', { name: 'Comfortable' }),
    ).toHaveFocus(),
  );
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(canvas.getByLabelText('Menu open request')).toHaveTextContent(
    'Menu: closed; reason: escape-key; event: keydown',
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
