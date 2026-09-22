import { isNonEmptyString } from '@sniptt/guards';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { arch, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { type z } from 'zod';

import { inventoryEnvironmentSchema } from '../schemas/inventoryEnvironmentSchema';
import { playwrightBrowserRegistrySchema } from '../schemas/playwrightBrowserRegistrySchema';
import { playwrightPackageSchema } from '../schemas/playwrightPackageSchema';

const require = createRequire(import.meta.url);

type InventoryEnvironment = z.infer<typeof inventoryEnvironmentSchema>;

export const getInventoryEnvironment = async ({
  browser,
  page,
  workspaceRoot,
  origin,
  launch,
  context,
}: {
  browser: Browser;
  page: Page;
  workspaceRoot: string;
  origin: string;
  launch: InventoryEnvironment['launch'];
  context: InventoryEnvironment['context'];
}) => {
  const browserRegistry = playwrightBrowserRegistrySchema.parse(
    JSON.parse(
      await readFile(
        resolve(
          dirname(require.resolve('playwright-core/package.json')),
          'browsers.json',
        ),
        'utf8',
      ),
    ),
  );
  const playwrightPackage = playwrightPackageSchema.parse(
    require('playwright/package.json'),
  );
  return inventoryEnvironmentSchema.parse({
    collectedAt: new Date().toISOString(),
    playwrightVersion: playwrightPackage.version,
    chromiumVersion: browser.version(),
    chromiumRevision: browserRegistry.browsers.find(
      (entry) => entry.name === 'chromium',
    )?.revision,
    executablePath: chromium.executablePath(),
    platform: platform(),
    architecture: arch(),
    operatingSystemRelease: release(),
    nodeVersion: process.version,
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: workspaceRoot,
      encoding: 'utf8',
    }).trim(),
    isWorkingTreeDirty: isNonEmptyString(
      execFileSync('git', ['status', '--porcelain'], {
        cwd: workspaceRoot,
        encoding: 'utf8',
      }).trim(),
    ),
    lockfileSha256: createHash('sha256')
      .update(await readFile(resolve(workspaceRoot, 'yarn.lock')))
      .digest('hex'),
    launch,
    context,
    origin,
    ...(await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      isSecureContext,
    }))),
  });
};
