import { expect, test } from '../lib/fixtures/screenshot';
test.describe.serial('Create Kanban View', () => {
test('Create Industry Select Field', async ({ page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();
    await page.getByRole('link', { name: 'Data model' }).click();
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await expect(page.getByRole('button', { name: 'New Field' })).toBeVisible();
    await page.getByRole('button', { name: 'New Field' }).click();
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
    await page.waitForURL('**/objects/opportunities');
    await page.waitForSelector('text=Industry');
    await expect(page.getByText('Industry')).toBeVisible();
});

test('Create Kanban View from Industry Select Field', async ({ page }) => {
  await page.getByRole('link', { name: 'Opportunities' }).click();
  await page.getByRole('button', { name: 'All Opportunities ·' }).click();
  await page.getByText('Add view').click();
  await page.getByRole('textbox').press('ControlOrMeta+a');
  await page.getByRole('textbox').fill('By industry');
  await page.getByRole('button', { name: 'Table', exact: true }).click();
  await page.getByText('Kanban').click();
  await page.locator('[aria-controls="view-picker-kanban-field-options"]').click();
  await page.getByRole('option', { name: 'Industry' }).click();
  // Use exact: true to ensure we only click the button with the label "Create"
  await page.getByRole('button', { name: 'Create new view' }).click();
  await expect(page.getByText('Food')).toBeVisible();
  await expect(page.getByText('Tech')).toBeVisible();
  await expect(page.getByText('Travel')).toBeVisible();
  await expect(page.getByText('No value')).toBeVisible();
  const byIndustryElements = await page.locator('text=By industry').all();
  expect(byIndustryElements.length).toBeGreaterThanOrEqual(1);
  for (const element of byIndustryElements) {
    await expect(element).toBeVisible();
  }
  await page.getByText('Options').click();
  await page.getByText('Group', { exact: true }).click();
  await Promise.all([page.getByTestId('hide-group-').click(),
    page.waitForRequest((req) => {
    return req.url().includes('/metadata') &&
           req.method() === 'POST';
  })]);
  await expect(page.getByText('No value')).not.toBeVisible();
});
})
