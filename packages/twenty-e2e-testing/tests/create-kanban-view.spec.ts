import { test } from '../lib/fixtures/screenshot';

if (process.env.LINK) {
  const baseURL = new URL(process.env.LINK).origin;
  test.use({ baseURL });
}
test('Create kanban view', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();
    await page.getByRole('link', { name: 'Data model' }).click();
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByRole('link', { name: 'Select', exact: true }).click();
    await page.getByRole('textbox', { name: 'Employees' }).click();
    await page.getByRole('textbox', { name: 'Employees' }).fill('Industry');
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).press('ControlOrMeta+a');
    await page.getByRole('textbox').nth(1).fill('Food');
    await page.getByRole('button', { name: 'Add option' }).click();
    await page.getByRole('button', { name: 'Option 2' }).getByRole('textbox').fill('Tech');
    await page.getByRole('button', { name: 'Add option' }).click();
    await page.getByRole('button', { name: 'Option 3' }).getByRole('textbox').fill('Travel');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Exit Settings' }).click();
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await page.getByRole('button', { name: 'All Opportunities ·' }).click();
    await page.getByText('Add view').click();
    await page.getByRole('textbox').press('ControlOrMeta+a');
    await page.getByRole('textbox').fill('By industry');
    await page.getByRole('button', { name: 'Table', exact: true }).click();
    await page.getByText('Kanban').click();
    await page.getByRole('button', { name: 'select', exact: true }).click();
    await page.locator('div').filter({ hasText: /^Industry$/ }).nth(2).click();
});
