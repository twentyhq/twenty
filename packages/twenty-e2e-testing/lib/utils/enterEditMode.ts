import { type Page } from '@playwright/test';

export const enterEditMode = async (page: Page) => {
  await page.getByTestId('page-header-side-panel-button').click();

  // Type to search for Edit Layout command
  const searchInput = page.getByTestId('side-panel-focus');
  await searchInput.fill('Edit Layout');

  // Click the Edit Layout command
  const editLayoutItem = page.getByText('Edit Layout', { exact: true });
  await editLayoutItem.click();

  // Wait for the layout customization bar to appear
  await page.getByText('Layout customization').waitFor({ state: 'visible' });
};
