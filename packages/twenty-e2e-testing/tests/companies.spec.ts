import { test, expect } from '../lib/fixtures/screenshot';

test.describe('Basic check', () => {
  test('Checking if table in Companies is visible', async ({ page }) => {
    await expect(page.getByTestId('tooltip').nth(0)).toHaveText('Companies');
    await expect(page.getByTestId('tooltip').nth(0)).toBeVisible();
    expect(page.url()).toContain('/companies');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody > tr')).toHaveCount(13); // shouldn't be hardcoded in case of tests on demo
  });

  test('', async ({ page }) => {
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await expect(page.locator('table')).toBeVisible();
  });
});
