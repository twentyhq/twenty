import { expect, test } from '@playwright/test';

test('Check if demo account is working properly @demo-only', async ({
  page,
}) => {
  await page.goto('https://demo.twenty.com/');
  await page.getByRole('button', { name: 'Continue With Email' }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Welcome to Twenty')).not.toBeVisible();
  await page.waitForTimeout(5000);
  await expect(page.getByText('Server’s on a coffee break')).not.toBeVisible({
    timeout: 5000,
  });
});
