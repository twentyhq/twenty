import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const dropdownTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', { name: 'Choose assignee' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  const assignment = await page.findByRole('menuitem', {
    name: /^Assign person/,
  });
  await waitFor(() => expect(assignment).toBeVisible());
  const disabledItem = page.getByRole('menuitem', { name: 'Archive assignee' });
  expect(disabledItem).toBeDisabled();
  await userEvent.click(disabledItem);
  expect(canvas.getByLabelText('Assignee')).toHaveTextContent(
    'Assignee: Unassigned',
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const duplicate = page.getByRole('menuitem', {
    name: 'Duplicate assignment',
  });
  expect(duplicate.tagName).toBe('BUTTON');
  expect(duplicate).toHaveAttribute('data-ref-tag', 'HTML-BUTTON');
  await userEvent.click(duplicate);
  await waitFor(() =>
    expect(canvas.getByLabelText('Assignment actions')).toHaveTextContent(
      'Actions: 1',
    ),
  );
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await userEvent.click(trigger);
  await userEvent.click(
    await page.findByRole('menuitem', { name: /^Assign person/ }),
  );
  const option = await page.findByText('Ada Lovelace');
  await waitFor(() => expect(option).toBeVisible());
  await userEvent.click(option);
  await waitFor(() =>
    expect(canvas.getByLabelText('Assignee')).toHaveTextContent(
      'Assignee: Ada Lovelace',
    ),
  );
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
