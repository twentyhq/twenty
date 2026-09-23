import { isNonEmptyArray, isNonEmptyString, isNull } from '@sniptt/guards';
import { type BrowserContext, type Locator } from 'playwright';

import { INVENTORY_FIXTURE_PROTOCOL } from '../constants/INVENTORY_FIXTURE_PROTOCOL';
import { type InventorySandboxRuntime } from '../types/InventorySandboxRuntime';

const { testIds } = INVENTORY_FIXTURE_PROTOCOL;

const throwOnHarnessError = async (harnessError: Locator) => {
  if (await harnessError.isVisible()) {
    throw new Error(`Harness failed: ${await harnessError.textContent()}`);
  }
};

export const collectSandboxInventory = async ({
  context,
  origin,
  runtime,
  timeout,
}: {
  context: BrowserContext;
  origin: string;
  runtime: InventorySandboxRuntime;
  timeout: number;
}): Promise<unknown> => {
  const deadline = Date.now() + timeout;
  const getRemainingTimeout = () => Math.max(1, deadline - Date.now());
  const page = await context.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('crash', () => pageErrors.push('Browser page crashed'));
  try {
    const response = await page.goto(
      `${origin}/iframe.html?id=${INVENTORY_FIXTURE_PROTOCOL.storyIdPrefix}${runtime}&viewMode=story`,
      { timeout: getRemainingTimeout() },
    );
    if (isNull(response) || !response.ok()) {
      throw new Error(
        `Story page responded with ${response?.status() ?? 'no response'}`,
      );
    }
    const collectButton = page.getByTestId(testIds.collect);
    const harnessError = page.getByTestId(testIds.harnessError);
    await collectButton
      .or(harnessError)
      .first()
      .waitFor({ timeout: getRemainingTimeout() });
    await throwOnHarnessError(harnessError);
    while (Date.now() < deadline) {
      const previousAttempt = await page
        .getByTestId(testIds.attempt)
        .textContent({ timeout: getRemainingTimeout() });
      await collectButton.click({ timeout: getRemainingTimeout() });
      await page.waitForFunction(
        ({ previousAttempt, attemptTestId, harnessErrorTestId }) =>
          document.querySelector(`[data-testid="${harnessErrorTestId}"]`) !==
            null ||
          document.querySelector(`[data-testid="${attemptTestId}"]`)
            ?.textContent !== previousAttempt,
        {
          previousAttempt,
          attemptTestId: testIds.attempt,
          harnessErrorTestId: testIds.harnessError,
        },
        { timeout: getRemainingTimeout() },
      );
      await throwOnHarnessError(harnessError);
      const failure = await page
        .getByTestId(testIds.failure)
        .textContent({ timeout: getRemainingTimeout() });
      if (failure === INVENTORY_FIXTURE_PROTOCOL.waitingForInitialization) {
        continue;
      }
      if (isNonEmptyString(failure)) {
        throw new Error(`Fixture failed: ${failure}`);
      }
      if (isNonEmptyArray(pageErrors)) {
        throw new Error('The story page reported errors');
      }
      const output = await page
        .getByTestId(testIds.output)
        .textContent({ timeout: getRemainingTimeout() });
      if (!isNonEmptyString(output)) {
        throw new Error('The fixture returned no inventory output');
      }
      return JSON.parse(output);
    }
    throw new Error('Fixture initialization timed out');
  } catch (error) {
    throw new Error(
      [`${runtime} inventory failed: ${String(error)}`, ...pageErrors].join(
        '; ',
      ),
    );
  } finally {
    await page.close();
  }
};
