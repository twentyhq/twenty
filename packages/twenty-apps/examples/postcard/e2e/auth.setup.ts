import { type Locator, expect, test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_DIR = path.resolve(__dirname, '.auth');
const STORAGE_STATE = path.join(AUTH_DIR, 'user.json');
const WORKSPACE_ORIGIN_FILE = path.join(AUTH_DIR, 'workspace-origin.txt');

const LOGIN = process.env.E2E_LOGIN ?? 'tim@apple.dev';
const PASSWORD = process.env.E2E_PASSWORD ?? 'tim@apple.dev';
const WORKSPACE_NAME = process.env.E2E_WORKSPACE_NAME ?? 'Apple';

const isVisible = async (locator: Locator) =>
  locator.isVisible().catch(() => false);

setup('authenticate', async ({ page }) => {
  await page.goto('/');

  // A fresh load shows the auth provider choice even when credentials are prefilled.
  const continueWithEmail = page.getByRole('button', {
    name: 'Continue with Email',
  });
  const emailField = page.getByPlaceholder('Email');

  // Wait on the concrete auth UI rather than networkidle (flaky per Playwright).
  await expect(continueWithEmail.or(emailField).first()).toBeVisible();

  if (await isVisible(continueWithEmail)) {
    await continueWithEmail.click();
  }

  if (await isVisible(emailField)) {
    await emailField.fill(LOGIN);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  const passwordField = page.getByPlaceholder('Password');
  await passwordField.waitFor({ state: 'visible' });
  await passwordField.fill(PASSWORD);

  const signInButton = page.getByRole('button', { name: 'Sign in' });
  await expect(signInButton).toBeEnabled();
  await signInButton.click();

  // Multi-workspace logins land on a picker; single-workspace logins skip it.
  const workspacePicker = page.getByText('Choose a workspace');
  const reachedPicker = await workspacePicker
    .waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true)
    .catch(() => false);

  if (reachedPicker) {
    await page.getByText(WORKSPACE_NAME, { exact: true }).click();
    await page.waitForFunction(() => window.location.href.includes('verify'));
    await page.waitForFunction(() => !window.location.href.includes('verify'));
  }

  await page.waitForFunction(
    () => window.localStorage.getItem('tokenPairState') !== null,
    undefined,
    { timeout: 15_000 },
  );

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(WORKSPACE_ORIGIN_FILE, new URL(page.url()).origin);

  await page.context().storageState({ path: STORAGE_STATE });
});
