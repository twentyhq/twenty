import { expect, test } from '../lib/fixtures/screenshot';
import { createCompany } from '../lib/requests/create-company';
import { deleteCompany } from '../lib/requests/delete-company';
import { destroyCompany } from '../lib/requests/destroy-company';
import { resetRecordPageLayout } from '../lib/requests/reset-record-page-layout';
import { enterEditMode } from '../lib/utils/enterEditMode';

const DEFAULT_TAB_NAMES = [
  'Home',
  'Timeline',
  'Tasks',
  'Notes',
  'Files',
  'Emails',
  'Calendar',
];

test.describe('Record page layout', () => {
  let companyId: string | undefined;

  test.beforeEach(async ({ page }) => {
    companyId = undefined;
    await resetRecordPageLayout({ page, objectNameSingular: 'company' });

    companyId = await createCompany({
      page,
      companyName: 'Layout E2E Test Company',
    });

    await page.goto(`/object/company/${companyId}`);
  });

  test.afterEach(async ({ page }) => {
    if (!companyId) return;
    await deleteCompany({ page, companyId });
    await destroyCompany({ page, companyId });
  });

  test('Full layout workflow: view, edit tabs, widgets, save, cancel, reset', async ({
    page,
  }) => {
    const sidePanel = page.locator('[data-side-panel]');
    const tabsContainer = page.getByTestId('page-layout-tab-list');

    // ===== PHASE 1: Default layout renders correctly =====

    for (const tabName of DEFAULT_TAB_NAMES.slice(1)) {
      const tab = tabsContainer.getByRole('link', {
        name: tabName,
        exact: true,
      });
      await expect(tab.last()).toBeVisible();
    }

    // ===== PHASE 2: Tab switching works in view mode =====

    await tabsContainer
      .getByRole('link', { name: 'Emails', exact: true })
      .click();
    await tabsContainer
      .getByRole('link', { name: 'Tasks', exact: true })
      .click();
    await tabsContainer
      .getByRole('link', { name: 'Timeline', exact: true })
      .click();

    // ===== PHASE 3: Enter edit mode =====

    await enterEditMode(page);

    // ===== PHASE 4: Create a new tab =====

    const defaultMoreTabsCount = 5;

    await expect(
      page.getByText(`+${defaultMoreTabsCount} More`, { exact: true }),
    ).toBeVisible();

    const newTabButton = tabsContainer.getByRole('button', { name: 'New Tab' });
    await newTabButton.click();

    const emptyTabInput = sidePanel.getByRole('textbox', { name: 'Tab' });
    await expect(emptyTabInput).toHaveValue('Untitled');

    await page.keyboard.press('Escape');

    await expect(
      page.getByText(`+${defaultMoreTabsCount + 1} More`, { exact: true }),
    ).toBeVisible();

    // ===== PHASE 5: Delete the newly created tab =====

    const deleteButton = sidePanel.getByText('Delete', { exact: true });
    await deleteButton.click();

    await expect(
      page.getByText(`+${defaultMoreTabsCount} More`, { exact: true }),
    ).toBeVisible();

    // ===== PHASE 6: Rename a tab =====

    const timelineTab = tabsContainer.getByText('Timeline', { exact: true });

    // Focus
    await timelineTab.click();
    // Edit
    await timelineTab.click();

    const titleLabel = sidePanel.getByText('Timeline');
    await titleLabel.click();

    const titleInput = sidePanel.getByRole('textbox');
    await titleInput.clear();
    await titleInput.fill('My Custom Timeline');
    await page.keyboard.press('Enter');

    const renamedTab = tabsContainer.getByText('My Custom Timeline', {
      exact: true,
    });
    await expect(renamedTab).toBeVisible();

    // ===== PHASE 7: Create a custom tab for duplication =====

    await newTabButton.click();

    const customTabInput = sidePanel.getByRole('textbox', { name: 'Tab' });
    await customTabInput.clear();
    await customTabInput.fill('Custom Tab');
    await page.keyboard.press('Enter');

    const moreButtonAfterCustomTabCreation = page.getByText(
      `+${defaultMoreTabsCount + 1} More`,
      { exact: true },
    );

    await moreButtonAfterCustomTabCreation.click();

    const customTab = page
      .getByRole('listbox')
      .getByRole('button', { name: 'Custom Tab', exact: true });
    await expect(customTab).toBeVisible();

    await page.keyboard.press('Escape');

    // ===== PHASE 8: Duplicate the custom tab =====

    const duplicateButton = sidePanel.getByText('Duplicate', { exact: true });
    await duplicateButton.click();

    const duplicatedTabInput = sidePanel.getByRole('textbox', { name: 'Tab' });

    await expect(duplicatedTabInput).toHaveValue('Custom Tab (Copy)');

    await page.keyboard.press('Escape');

    const moreButtonAfterTabDuplication = page.getByText(
      `+${defaultMoreTabsCount + 2} More`,
      { exact: true },
    );

    await expect(moreButtonAfterTabDuplication).toBeVisible();

    // ===== PHASE 9: Reorder a tab (move left) =====

    await moreButtonAfterTabDuplication.click();

    const tasksTab = page.getByRole('listbox').getByRole('button', {
      name: 'Tasks',
      exact: true,
    });
    await tasksTab.click();

    const moveLeftButton = sidePanel.getByText('Move left', { exact: true });
    await moveLeftButton.click();

    await expect(
      tabsContainer.getByRole('button', { name: 'Tasks', exact: true }),
    ).toBeVisible();

    await moreButtonAfterTabDuplication.click();

    await expect(
      page.getByRole('listbox').getByRole('button', {
        name: 'My Custom Timeline',
        exact: true,
      }),
    ).toBeVisible();

    // ===== PHASE 10: Cancel discards all changes =====

    await page.getByRole('button', { name: 'Cancel' }).click();

    // After canceling, all changes should be reverted
    await expect(
      tabsContainer.getByText('My Custom Timeline', { exact: true }),
    ).not.toBeVisible();

    await expect(
      tabsContainer.getByText('Custom Tab (Copy)', { exact: true }),
    ).not.toBeVisible();

    await expect(
      tabsContainer.getByText('Custom Tab', { exact: true }),
    ).not.toBeVisible();

    await expect(
      tabsContainer.getByText('Timeline', { exact: true }),
    ).toBeVisible();

    // ===== PHASE 11: Create a tab, save, and verify persistence =====

    await enterEditMode(page);

    await newTabButton.click();

    const newTabInput = sidePanel.getByRole('textbox', { name: 'Tab' });
    await expect(newTabInput).toHaveValue('Untitled');

    await newTabInput.clear();
    await newTabInput.fill('Persisted Tab');
    await page.keyboard.press('Enter');

    // Add a widget so the tab is not filtered out as empty
    const persistedTabFieldsGroup = page
      .getByText('Fields group', {
        exact: true,
      })
      .nth(1);
    await persistedTabFieldsGroup.click();

    await expect(sidePanel.getByText('Data and display')).toBeVisible();

    const saveButton = page.getByRole('button', { name: 'Save' });

    await saveButton.click();

    await expect(saveButton).not.toBeVisible();

    // Reload the page to verify persistence
    await page.goto(`/object/company/${companyId}`);

    const persistedTab = tabsContainer.getByText('Persisted Tab', {
      exact: true,
    });
    await expect(persistedTab).toBeVisible();

    // ===== PHASE 12: Clean up - delete the persisted tab =====

    await enterEditMode(page);

    const moreButtonAfterPersistedTabCreation = page.getByText(
      `+${defaultMoreTabsCount + 1} More`,
      { exact: true },
    );

    await moreButtonAfterPersistedTabCreation.click();

    const persistedTabInListBox = page
      .getByRole('listbox')
      .getByText('Persisted Tab', { exact: true });

    await persistedTabInListBox.hover();
    await page.getByTestId('tab-list-item-edit-button').click();

    const deletePersistedButton = sidePanel.getByText('Delete', {
      exact: true,
    });
    await deletePersistedButton.click();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      tabsContainer.getByText('Persisted Tab', { exact: true }),
    ).not.toBeVisible();

    await expect(
      tabsContainer.getByText('Timeline', { exact: true }),
    ).toBeVisible();

    // ===== PHASE 13: Widget management =====

    await enterEditMode(page);

    // Add a fields group widget on Home tab
    const fieldsGroupOption = page.getByText('Field', { exact: true });
    await fieldsGroupOption.click();

    const createdFieldWidgetTitle = page.getByRole('button', {
      name: 'Account Owner',
      exact: true,
    });
    await expect(createdFieldWidgetTitle).toBeVisible();

    await createdFieldWidgetTitle.click();

    // Delete the widget
    const deleteWidgetButton = sidePanel.getByText('Delete widget');
    await deleteWidgetButton.click();

    await expect(createdFieldWidgetTitle).not.toBeVisible();

    // Cancel to discard widget changes
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
