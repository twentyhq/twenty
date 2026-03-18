// E2E: requires live stack — un-skip in CI or local dev with servers running.
import { expect, test } from '../lib/fixtures/screenshot';

test.skip(
  'AC-001: shows duplicate warning before persisting a new company',
  async ({ page }) => {
    await page.getByRole('link', { name: 'Companies' }).click();
    await page.getByRole('button', { name: 'Create new company' }).click();

    await page.getByRole('textbox', { name: 'Name' }).fill('Acme Corp');
    await page.getByRole('textbox', { name: 'Domain' }).fill('acme.com');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('heading', { name: 'Potential duplicate companies' }),
    ).toBeVisible();
  },
);

test.skip(
  'AC-002: lists duplicate companies with name and primary domain',
  async ({ page }) => {
    await page.getByRole('link', { name: 'Companies' }).click();
    await page.getByRole('button', { name: 'Create new company' }).click();

    await page.getByRole('textbox', { name: 'Name' }).fill('Acme Corp');
    await page.getByRole('textbox', { name: 'Domain' }).fill('acme.com');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Acme Corp')).toBeVisible();
    await expect(page.getByText('acme.com')).toBeVisible();
  },
);

test.skip(
  'AC-003: shows an error state when duplicate lookup is unavailable',
  async ({ page }) => {
    await page.getByRole('link', { name: 'Companies' }).click();
    await page.getByRole('button', { name: 'Create new company' }).click();

    await page.getByRole('textbox', { name: 'Name' }).fill('Acme Corp');
    await page.getByRole('textbox', { name: 'Domain' }).fill('acme.com');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Unable to check for duplicates')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  },
);
