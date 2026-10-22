import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { dropdownSelectionGroupsTest } from '@/__stories__/twenty-ui-gallery/utils/dropdownSelectionGroupsTest';

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
  const ada = page.getByRole('option', { name: /^Ada Lovelace/ });
  const grace = page.getByRole('option', { name: /^Grace Hopper/ });
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
  await userEvent.type(search, 'e');
  await waitFor(() => expect(ada).toHaveAttribute('data-highlighted'), {
    timeout: INTERACTION_TIMEOUT,
  });
  expect(search).toHaveAttribute('aria-activedescendant', ada.id);
  const outsidePicker = canvas.getByRole('button', { name: 'Outside picker' });
  await userEvent.click(outsidePicker);
  await waitFor(() => expect(outsidePicker).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(page.getByRole('dialog', { name: 'Assignee actions' })).toBeVisible();
  await waitFor(
    () => expect(search).not.toHaveAttribute('aria-activedescendant'),
    { timeout: INTERACTION_TIMEOUT },
  );
  expect(ada).not.toHaveAttribute('data-highlighted');
  expect(grace).not.toHaveAttribute('data-highlighted');
  await userEvent.click(search);
  await waitFor(() => expect(ada).toHaveAttribute('data-highlighted'), {
    timeout: INTERACTION_TIMEOUT,
  });
  expect(search).toHaveAttribute('aria-activedescendant', ada.id);
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(ada).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  await waitFor(
    () => {
      expect(search).not.toHaveAttribute('aria-activedescendant');
      expect(ada).not.toHaveAttribute('data-highlighted');
    },
    { timeout: INTERACTION_TIMEOUT },
  );
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(grace).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  expect(ada).not.toHaveAttribute('data-highlighted');
  await userEvent.keyboard('{ArrowUp}');
  await waitFor(() => expect(ada).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  await userEvent.keyboard('{ArrowUp}');
  await waitFor(() => expect(search).toHaveFocus(), {
    timeout: INTERACTION_TIMEOUT,
  });
  await waitFor(() => expect(ada).toHaveAttribute('data-highlighted'), {
    timeout: INTERACTION_TIMEOUT,
  });
  await userEvent.click(page.getByRole('button', { name: 'Rank last first' }));
  await waitFor(() => expect(page.getAllByRole('option')[0]).toBe(grace));
  await waitFor(() =>
    expect(search).not.toHaveAttribute('aria-activedescendant'),
  );
  expect(ada).not.toHaveAttribute('data-highlighted');
  expect(grace).not.toHaveAttribute('data-highlighted');
  await userEvent.click(search);
  await waitFor(() => expect(grace).toHaveAttribute('data-highlighted'), {
    timeout: INTERACTION_TIMEOUT,
  });
  expect(search).toHaveAttribute('aria-activedescendant', grace.id);
  expect(ada).not.toHaveAttribute('data-highlighted');
  await userEvent.clear(search);
  await waitFor(() =>
    expect(canvas.getByLabelText('Search query')).toHaveTextContent(/^Query:$/),
  );
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
  await userEvent.click(trigger);
  await userEvent.click(
    await page.findByRole('menuitem', { name: /^Assign person/ }),
  );
  let reopenedSearch = await page.findByRole('searchbox', {
    name: 'Search people',
  });
  await waitFor(() => expect(reopenedSearch).toHaveFocus());
  const selectedAda = page.getByRole('option', { name: /^Ada Lovelace/ });
  expect(selectedAda).toHaveAttribute('aria-selected', 'true');
  await userEvent.type(reopenedSearch, 'Grace');
  await waitFor(() => expect(reopenedSearch).toHaveValue('Grace'));
  await waitFor(() =>
    expect(canvas.getByLabelText('Search query')).toHaveTextContent(
      /^Query: Grace$/,
    ),
  );
  await waitFor(() =>
    expect(page.queryByRole('option', { name: /^Ada Lovelace/ })).toBeNull(),
  );
  expect(canvas.getByLabelText('Assignee')).toHaveTextContent(
    'Assignee: Ada Lovelace',
  );
  const draft = page.getByRole('textbox', { name: 'Assignment note' });
  await userEvent.type(draft, 'Reviewed');
  await waitFor(() => expect(draft).toHaveValue('Reviewed'));
  await userEvent.click(page.getByRole('button', { name: 'People' }));
  const pageOpener = await page.findByRole('menuitem', {
    name: /^Assign person/,
  });
  await waitFor(() => expect(pageOpener).toHaveFocus());
  expect(page.queryByRole('searchbox', { name: 'Search people' })).toBeNull();
  expect(reopenedSearch).toBeInTheDocument();
  expect(reopenedSearch).not.toBeVisible();
  expect(draft).not.toBeVisible();
  expect(reopenedSearch.closest('[data-dropdown-page-type]')).toHaveAttribute(
    'inert',
  );
  await userEvent.click(pageOpener);
  await waitFor(() => expect(reopenedSearch).toHaveFocus());
  expect(page.getByRole('searchbox', { name: 'Search people' })).toBe(
    reopenedSearch,
  );
  expect(reopenedSearch).toHaveValue('Grace');
  expect(page.getByRole('textbox', { name: 'Assignment note' })).toBe(draft);
  expect(draft).toHaveValue('Reviewed');
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await userEvent.click(trigger);
  const defaultPageOpener = await page.findByRole('menuitem', {
    name: /^Assign person/,
  });
  await waitFor(
    () =>
      expect(
        page.getByRole('menu', { name: 'Assignee actions' }),
      ).toBeVisible(),
    { timeout: INTERACTION_TIMEOUT },
  );
  expect(page.queryByRole('searchbox', { name: 'Search people' })).toBeNull();
  await userEvent.click(defaultPageOpener);
  reopenedSearch = await page.findByRole('searchbox', {
    name: 'Search people',
  });
  await waitFor(() => expect(reopenedSearch).toHaveFocus());
  expect(reopenedSearch).toHaveValue('Grace');
  expect(page.getByRole('textbox', { name: 'Assignment note' })).toHaveValue(
    '',
  );
  await userEvent.clear(reopenedSearch);
  await waitFor(() =>
    expect(canvas.getByLabelText('Search query')).toHaveTextContent(/^Query:$/),
  );
  await waitFor(() =>
    expect(page.getByRole('option', { name: /^Ada Lovelace/ })).toHaveAttribute(
      'aria-selected',
      'true',
    ),
  );
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await userEvent.click(trigger);
  await userEvent.click(
    await page.findByRole('menuitem', { name: /^Assign person/ }),
  );
  const activationSearch = await page.findByRole('searchbox', {
    name: 'Search people',
  });
  await waitFor(() => expect(activationSearch).toHaveFocus());
  await userEvent.type(activationSearch, 'Grace');
  await waitFor(() => expect(activationSearch).toHaveValue('Grace'));
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Assignee')).toHaveTextContent(
      'Assignee: Grace Hopper',
    ),
  );
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await dropdownSelectionGroupsTest({ canvasElement });
  expect(errorHandler).not.toHaveBeenCalled();
};
