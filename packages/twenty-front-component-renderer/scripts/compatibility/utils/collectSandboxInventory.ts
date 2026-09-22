import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type BrowserContext } from 'playwright';

import { INVENTORY_FIXTURE_PROTOCOL } from '../constants/INVENTORY_FIXTURE_PROTOCOL';

export const collectSandboxInventory = async ({
  context,
  origin,
  runtime,
  timeout,
}: {
  context: BrowserContext;
  origin: string;
  runtime: 'react' | 'preact';
  timeout: number;
}): Promise<unknown> => {
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('crash', () => errors.push('Browser page crashed'));
  try {
    page.setDefaultTimeout(timeout);
    await page.goto(
      `${origin}/iframe.html?id=frontcomponent-worker-platform-apis--compatibility-inventory-${runtime}&viewMode=story`,
      { timeout },
    );
    const collectButton = page.getByTestId(
      INVENTORY_FIXTURE_PROTOCOL.testIds.collect,
    );
    await collectButton.waitFor();
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const previousAttempt = await page
        .getByTestId(INVENTORY_FIXTURE_PROTOCOL.testIds.attempt)
        .textContent();
      await collectButton.click({
        timeout: Math.max(1, deadline - Date.now()),
      });
      await page.waitForFunction(
        ({ previousAttempt, attemptTestId }) => {
          const attempt = document.querySelector(
            `[data-testid="${attemptTestId}"]`,
          )?.textContent;
          return attempt !== previousAttempt;
        },
        {
          previousAttempt,
          attemptTestId: INVENTORY_FIXTURE_PROTOCOL.testIds.attempt,
        },
        { timeout: Math.max(1, deadline - Date.now()) },
      );
      const error = await page
        .getByTestId(INVENTORY_FIXTURE_PROTOCOL.testIds.failure)
        .textContent();
      if (error === INVENTORY_FIXTURE_PROTOCOL.waitingForInitialization) {
        continue;
      }
      if (isNonEmptyString(error) || isNonEmptyArray(errors)) {
        throw new Error(
          `${runtime} fixture failed: ${[error, ...errors].join('; ')}`,
        );
      }
      const output = await page
        .getByTestId(INVENTORY_FIXTURE_PROTOCOL.testIds.output)
        .textContent();
      return JSON.parse(output ?? 'null');
    }
    throw new Error(`${runtime} fixture initialization timed out`);
  } catch (error) {
    throw new Error(
      `${runtime} inventory failed: ${String(error)} ${errors.join('; ')}`,
    );
  } finally {
    await page.close();
  }
};
