import { type BrowserContext } from 'playwright';

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
    const collectButton = page.getByTestId('compatibility-collect');
    await collectButton.waitFor();
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const previousAttempt = await page
        .getByTestId('compatibility-attempt')
        .textContent();
      await collectButton.click({
        timeout: Math.max(1, deadline - Date.now()),
      });
      await page.waitForFunction(
        (previous) => {
          const attempt = document.querySelector(
            '[data-testid="compatibility-attempt"]',
          )?.textContent;
          return attempt !== previous;
        },
        previousAttempt,
        { timeout: Math.max(1, deadline - Date.now()) },
      );
      const error = await page
        .getByTestId('compatibility-fixture-error')
        .textContent();
      if (error === 'waiting-for-initialization') {
        continue;
      }
      if (error || errors.length > 0) {
        throw new Error(
          `${runtime} fixture failed: ${[error, ...errors].join('; ')}`,
        );
      }
      const output = await page
        .getByTestId('compatibility-output')
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
