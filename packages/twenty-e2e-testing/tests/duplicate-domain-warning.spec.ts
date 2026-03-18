// E2E: requires live stack — un-skip in CI or local dev with servers running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip(
  'AC-001: duplicate warning still allows continuing with a duplicate domain',
  async ({ page }) => {
    await page.getByRole('link', { name: 'Companies' }).click();
    await page.getByRole('button', { name: 'Create new company' }).click();

    await page.getByRole('textbox', { name: 'Name' }).fill('Acme Clone');
    await page.getByRole('textbox', { name: 'Domain' }).fill('acme.com');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('heading', { name: 'Potential duplicate companies' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Continue anyway' }).click();

    await expect(page).toHaveURL(/\/companies\/.+/);
    await expect(
      page.getByRole('heading', { name: 'Acme Clone' }),
    ).toBeVisible();
  },
);

test.skip(
  'AC-002: duplicate warning continues to surface the existing company before persistence',
  async ({ page }) => {
    await page.getByRole('link', { name: 'Companies' }).click();
    await page.getByRole('button', { name: 'Create new company' }).click();

    await page.getByRole('textbox', { name: 'Name' }).fill('Acme Clone');
    await page.getByRole('textbox', { name: 'Domain' }).fill('acme.com');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('heading', { name: 'Potential duplicate companies' }),
    ).toBeVisible();
    await expect(page.getByText('acme.com')).toBeVisible();
  },
);
