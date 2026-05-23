import { type Page } from '@playwright/test';

import { expect, test } from '../lib/fixtures/screenshot';
import { DataModelSection } from '../lib/pom/settings/dataModelSection';
import { withCtrlOrMeta } from '../lib/utils/keyboardShortcuts';

const sidePanel = (page: Page) => page.locator('[data-side-panel]');
const commandMenuSearchInput = (page: Page) =>
  page.getByTestId('side-panel-focus');

async function openCommandMenuWithShortcut(page: Page) {
  await expect(page.getByTestId('page-header-side-panel-button')).toBeVisible();

  await withCtrlOrMeta(page, () => page.keyboard.press('k'));

  await expect(commandMenuSearchInput(page)).toBeVisible();
  await expect(commandMenuSearchInput(page)).toBeFocused();
}

async function openCommandMenuWithHeaderButton(page: Page) {
  const sidePanelButton = page.getByTestId('page-header-side-panel-button');

  await expect(sidePanelButton).toBeVisible();
  await sidePanelButton.click();

  await expect(commandMenuSearchInput(page)).toBeVisible();
  await expect(commandMenuSearchInput(page)).toBeFocused();
}

async function searchCommandMenu(page: Page, query: string) {
  await commandMenuSearchInput(page).fill(query);
  await expect(commandMenuSearchInput(page)).toHaveValue(query);
}

async function selectVisibleCommandMenuItem(page: Page, label: string) {
  await expect(sidePanel(page).getByText(label, { exact: true })).toBeVisible();

  await page.keyboard.press('Enter');
}

async function expectCreateRecordForm(page: Page, objectLabelSingular: string) {
  await expect(
    sidePanel(page).getByText(`New ${objectLabelSingular}`, { exact: true }),
  ).toBeVisible();
}

async function fillCreateRecordName(page: Page, name: string) {
  const nameInput = sidePanel(page).getByRole('textbox').first();

  await expect(nameInput).toBeVisible();
  await nameInput.fill(name);
}

async function expectCreateRecordSubmitButton(page: Page) {
  const createButton = sidePanel(page)
    .getByRole('button', { name: /Create/ })
    .last();

  await expect(createButton).toBeVisible();
  await expect(createButton.locator('svg')).toHaveCount(1);
  await expect(createButton).toContainText(/(Ctrl\s*⏎|⌘⏎)/);
}

async function submitCreateRecordFormWithShortcut(page: Page) {
  await withCtrlOrMeta(page, () => page.keyboard.press('Enter'));
}

test.describe.serial('Dynamic create record commands', () => {
  test.setTimeout(90_000);

  const suffix = `A${Date.now().toString(36).replace(/[0-9]/g, '')}`;
  const customObjectSingularLabel = `Codex Vessel ${suffix}`;
  const customObjectPluralLabel = `Codex Vessels ${suffix}`;
  const customRecordName = `E2E Record ${suffix}`;

  test('custom object command works from keyboard shortcut', async ({
    page,
  }) => {
    const dataModelSection = new DataModelSection(page);

    await page.goto('/settings/objects');
    await dataModelSection.createObject({
      singularLabel: customObjectSingularLabel,
      pluralLabel: customObjectPluralLabel,
    });

    await page.goto('/objects/people');
    await openCommandMenuWithShortcut(page);
    await searchCommandMenu(page, `create ${customObjectSingularLabel}`);
    await selectVisibleCommandMenuItem(
      page,
      `Create ${customObjectSingularLabel}`,
    );

    await expectCreateRecordForm(page, customObjectSingularLabel);
    await fillCreateRecordName(page, customRecordName);
    await expectCreateRecordSubmitButton(page);
    await submitCreateRecordFormWithShortcut(page);

    await expect(
      sidePanel(page).getByText(customRecordName, { exact: true }),
    ).toBeVisible();
    await expect(
      sidePanel(page).getByText(`New ${customObjectSingularLabel}`, {
        exact: true,
      }),
    ).not.toBeVisible();

    await page.getByTestId('page-header-side-panel-button').click();
    await expect(commandMenuSearchInput(page)).not.toBeVisible();
  });

  test('custom object command works from header command menu button', async ({
    page,
  }) => {
    await page.goto('/objects/people');
    await openCommandMenuWithHeaderButton(page);
    await searchCommandMenu(page, `create ${customObjectSingularLabel}`);
    await selectVisibleCommandMenuItem(
      page,
      `Create ${customObjectSingularLabel}`,
    );

    await expectCreateRecordForm(page, customObjectSingularLabel);

    await page.getByTestId('page-header-side-panel-button').click();
    await expect(commandMenuSearchInput(page)).not.toBeVisible();
  });

  test('same-object create command is not duplicated', async ({ page }) => {
    await page.goto('/objects/companies');
    await openCommandMenuWithHeaderButton(page);
    await searchCommandMenu(page, 'create company');

    await expect(
      sidePanel(page).getByText('Create Company', { exact: true }),
    ).toHaveCount(1);

    await searchCommandMenu(page, 'create person');
    await selectVisibleCommandMenuItem(page, 'Create Person');

    await expectCreateRecordForm(page, 'Person');
  });
});
