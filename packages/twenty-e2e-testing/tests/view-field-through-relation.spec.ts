import { expect, test } from '../lib/fixtures/screenshot';

const TRAVERSED_COLUMN_LABEL = 'Company › Employees';

test.describe.serial('View field through a relation', () => {
  // Unique per run: the index view is hidden from the picker, so the test works on its own table view.
  const viewName = `Through relation ${Date.now()}`;

  test('Add, sort and hide Company › Employees on an opportunities table view', async ({
    page,
  }) => {
    // Two full page loads on a dev server do not fit in the default timeout.
    test.setTimeout(180000);

    // The sidebar link targets a seeded view; loading its URL directly skips the last-visited redirect
    // so the new view copies its fields from a known source.
    const opportunitiesLink = page.getByRole('link', { name: 'Opportunities' });
    await page.goto((await opportunitiesLink.getAttribute('href')) ?? '/objects/opportunities');
    await page.getByRole('button', { name: / · \d+$/ }).first().click();
    await page.getByText('Add view').click();
    await page.getByRole('textbox').press('ControlOrMeta+a');
    await page.getByRole('textbox').fill(viewName);
    // The layout button is named after the current layout, which follows the view being left.
    await page.getByRole('button', { name: /^(Table|Kanban|Calendar)$/ }).click();
    await page.getByText('Table', { exact: true }).last().click();
    await page.getByRole('button', { name: 'Create new view' }).click();
    await expect(page.getByRole('button', { name: 'Add column' })).toBeVisible({
      timeout: 60000,
    });
    // Column header menus stay closed right after a view is created from the picker, a reload clears it.
    await page.reload();
    await expect(page.getByRole('button', { name: 'Add column' })).toBeVisible({
      timeout: 60000,
    });

    const traversedColumnHeader = page.locator('.header-cell', {
      hasText: TRAVERSED_COLUMN_LABEL,
    });
    // The innermost header button is the dropdown trigger.
    const traversedColumnHeaderMenuTrigger = page
      .getByRole('button', { name: TRAVERSED_COLUMN_LABEL, exact: true })
      .last();
    const traversedColumnHeaderMenu = page.getByRole('menu', {
      name: TRAVERSED_COLUMN_LABEL,
    });

    // The new view copies the fields of the view it was created from, which may already traverse the relation.
    if (await traversedColumnHeader.isVisible()) {
      await traversedColumnHeaderMenuTrigger.click();
      await traversedColumnHeaderMenu.getByText('Hide', { exact: true }).click();
      await expect(traversedColumnHeader).not.toBeVisible();
    }

    const fieldSearch = page.getByRole('searchbox', { name: 'Search fields' });

    await page.getByRole('button', { name: 'Add column' }).click();
    await fieldSearch.fill('Comp');
    await page.getByText('Company', { exact: true }).last().click();
    await page.getByText('Employees', { exact: true }).click();

    await expect(traversedColumnHeader).toBeVisible();

    await traversedColumnHeaderMenuTrigger.click();
    await traversedColumnHeaderMenu.getByText('Sort', { exact: true }).click();
    // The sort chip in the view bar carries the same combined label as the column.
    await expect(
      page.getByText(TRAVERSED_COLUMN_LABEL, { exact: true }),
    ).toHaveCount(2);

    await traversedColumnHeaderMenuTrigger.click();
    await traversedColumnHeaderMenu.getByText('Hide', { exact: true }).click();
    await expect(traversedColumnHeader).not.toBeVisible();
  });
});
