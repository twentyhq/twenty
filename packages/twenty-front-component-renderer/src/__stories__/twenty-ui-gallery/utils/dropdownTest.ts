import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
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
  await waitFor(() => expect(assignment).toBeVisible(), {
    timeout: INTERACTION_TIMEOUT,
  });
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
  const search = await page.findByRole('searchbox', { name: 'Search people' });
  await waitFor(() => expect(search).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  const ada = page.getByRole('button', { name: /^Ada Lovelace/ });
  const grace = page.getByRole('button', { name: /^Grace Hopper/ });
  const createPerson = page.getByRole('button', { name: 'Create person' });
  await waitFor(() => expect(ada).toHaveAttribute('tabindex', '0'));
  expect(grace).toHaveAttribute('tabindex', '-1');
  expect(createPerson).toHaveAttribute('tabindex', '-1');
  await userEvent.tab();
  await waitFor(() => expect(ada).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(grace).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  await userEvent.tab({ shift: true });
  await waitFor(() => expect(search).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  await waitFor(() => expect(grace).toHaveAttribute('tabindex', '0'));
  await userEvent.tab();
  await waitFor(() => expect(grace).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  expect(canvas.getByLabelText('Assignee')).toHaveTextContent(
    'Assignee: Unassigned',
  );
  await userEvent.click(page.getByRole('button', { name: 'Rank last first' }));
  await userEvent.type(search, 'e');
  await waitFor(() => expect(grace).toHaveAttribute('data-highlighted'), {
    timeout: INTERACTION_TIMEOUT,
  });
  expect(search).toHaveAttribute('aria-activedescendant', grace.id);
  expect(ada).not.toHaveAttribute('data-highlighted');
  const option = await page.findByText('Ada Lovelace');
  await waitFor(() => expect(option).toBeVisible(), {
    timeout: INTERACTION_TIMEOUT,
  });
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
