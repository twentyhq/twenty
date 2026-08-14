# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate
- Location: e2e/auth.setup.ts:16:6

# Error details

```
Error: page.goto: net::ERR_CONNECTION_RESET at https://springfield-ipaq-everybody-tom.trycloudflare.com/
Call log:
  - navigating to "https://springfield-ipaq-everybody-tom.trycloudflare.com/", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This site can’t be reached" [level=1] [ref=e7]
    - paragraph [ref=e8]: The connection was reset.
    - generic [ref=e9]:
      - paragraph [ref=e10]: "Try:"
      - list [ref=e11]:
        - listitem [ref=e12]: Checking the connection
        - listitem [ref=e13]:
          - link "Checking the proxy and the firewall" [ref=e14] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=e15]: ERR_CONNECTION_RESET
  - generic [ref=e16]:
    - button "Reload" [ref=e18] [cursor=pointer]
    - button "Details" [ref=e19] [cursor=pointer]
```

# Test source

```ts
  1  | import { type Locator, expect, test as setup } from '@playwright/test';
  2  | import * as fs from 'fs';
  3  | import * as path from 'path';
  4  | 
  5  | const AUTH_DIR = path.resolve(__dirname, '.auth');
  6  | const STORAGE_STATE = path.join(AUTH_DIR, 'user.json');
  7  | const WORKSPACE_ORIGIN_FILE = path.join(AUTH_DIR, 'workspace-origin.txt');
  8  | 
  9  | const LOGIN = process.env.E2E_LOGIN ?? 'tim@apple.dev';
  10 | const PASSWORD = process.env.E2E_PASSWORD ?? 'tim@apple.dev';
  11 | const WORKSPACE_NAME = process.env.E2E_WORKSPACE_NAME ?? 'Apple';
  12 | 
  13 | const isVisible = async (locator: Locator) =>
  14 |   locator.isVisible().catch(() => false);
  15 | 
  16 | setup('authenticate', async ({ page }) => {
> 17 |   await page.goto('/');
     |              ^ Error: page.goto: net::ERR_CONNECTION_RESET at https://springfield-ipaq-everybody-tom.trycloudflare.com/
  18 | 
  19 |   // A fresh load shows the auth provider choice even when credentials are prefilled.
  20 |   const continueWithEmail = page.getByRole('button', {
  21 |     name: 'Continue with Email',
  22 |   });
  23 |   const emailField = page.getByPlaceholder('Email');
  24 | 
  25 |   // Wait on the concrete auth UI rather than networkidle (flaky per Playwright).
  26 |   await expect(continueWithEmail.or(emailField).first()).toBeVisible();
  27 | 
  28 |   if (await isVisible(continueWithEmail)) {
  29 |     await continueWithEmail.click();
  30 |   }
  31 | 
  32 |   if (await isVisible(emailField)) {
  33 |     await emailField.fill(LOGIN);
  34 |     await page.getByRole('button', { name: 'Continue', exact: true }).click();
  35 |   }
  36 | 
  37 |   const passwordField = page.getByPlaceholder('Password');
  38 |   await passwordField.waitFor({ state: 'visible' });
  39 |   await passwordField.fill(PASSWORD);
  40 | 
  41 |   const signInButton = page.getByRole('button', { name: 'Sign in' });
  42 |   await expect(signInButton).toBeEnabled();
  43 |   await signInButton.click();
  44 | 
  45 |   // Multi-workspace logins land on a picker; single-workspace logins skip it.
  46 |   const workspacePicker = page.getByText('Choose a workspace');
  47 |   const reachedPicker = await workspacePicker
  48 |     .waitFor({ state: 'visible', timeout: 10_000 })
  49 |     .then(() => true)
  50 |     .catch(() => false);
  51 | 
  52 |   if (reachedPicker) {
  53 |     await page.getByText(WORKSPACE_NAME, { exact: true }).click();
  54 |     await page.waitForFunction(() => window.location.href.includes('verify'));
  55 |     await page.waitForFunction(() => !window.location.href.includes('verify'));
  56 |   }
  57 | 
  58 |   await page.waitForFunction(
  59 |     () => window.localStorage.getItem('tokenPairState') !== null,
  60 |     undefined,
  61 |     { timeout: 15_000 },
  62 |   );
  63 | 
  64 |   fs.mkdirSync(AUTH_DIR, { recursive: true });
  65 |   fs.writeFileSync(WORKSPACE_ORIGIN_FILE, new URL(page.url()).origin);
  66 | 
  67 |   await page.context().storageState({ path: STORAGE_STATE });
  68 | });
  69 | 
```