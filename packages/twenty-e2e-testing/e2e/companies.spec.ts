import { expect, test } from '@playwright/test';

test.describe('visible table', () => {
  test('table should be visible on navigation to /objects/companies', async ({
    page,
  }) => {
    // Navigate to the page
    await page.goto('/objects/companies');

    // Check if the table is visible
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });
});
