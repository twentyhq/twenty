import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const menuTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Account actions' });

  expect(trigger.tagName).toBe('BUTTON');
  expect(trigger).toHaveAttribute('data-ref-tag', 'HTML-BUTTON');
  expect(trigger).toHaveAttribute('data-native-trigger', 'account');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Cancel menu opening' }),
  );
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(canvas.getByLabelText('Menu open request')).toHaveTextContent(
      'Menu: closed; reason: trigger-press; event: mousedown',
    ),
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Allow menu opening' }),
  );
  await userEvent.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

  const item = await page.findByRole('menuitem', { name: /^Duplicate/ });
  const disabledItem = page.getByRole('menuitem', { name: 'Archive' });
  await waitFor(() => expect(item).toBeVisible());
  expect(item.tagName).toBe('BUTTON');
  expect(item).toHaveAttribute('data-ref-tag', 'HTML-BUTTON');
  expect(page.getByRole('menu').tagName).toBe('SECTION');
  expect(page.getByRole('menu')).toHaveAttribute('data-menu-popup', '');
  expect(page.getByRole('menuitem', { name: 'Account link' })).toHaveAttribute(
    'href',
    '#menu-destination',
  );
  expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(disabledItem);
  expect(canvas.getByLabelText('Menu action')).toHaveTextContent(
    'Action: none',
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(item);
  await waitFor(() =>
    expect(canvas.getByLabelText('Menu action')).toHaveTextContent(
      'Action: duplicated:HTML-BUTTON',
    ),
  );
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(canvas.getByLabelText('Menu open request')).toHaveTextContent(
    'Menu: closed; reason: item-press; event: click',
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
