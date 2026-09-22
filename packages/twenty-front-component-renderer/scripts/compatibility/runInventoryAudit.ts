import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { isObject } from '@sniptt/guards';
import { getInventoryEnvironment } from './utils/getInventoryEnvironment';
import { inventoryCatalogSchema } from './schemas/inventoryCatalogSchema';
import { inventoryReportSchema } from './schemas/inventoryReportSchema';
import { collectNativeInventory } from './utils/collectNativeInventory';
import { collectSandboxInventory } from './utils/collectSandboxInventory';
import { compareInventoryCollections } from './utils/compareInventoryCollections';
import { startInventoryServer } from './utils/startInventoryServer';
import { summarizeInventoryReport } from './utils/summarizeInventoryReport';
import { withInventoryTimeout } from './utils/withInventoryTimeout';
import { validateInventoryCollection } from './utils/validateInventoryCollection';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const workspaceRoot = resolve(projectRoot, '../..');
const outputDirectory = resolve(projectRoot, 'compatibility-results');
const COLLECTION_TIMEOUT = 60_000;

const runInventoryAudit = async () => {
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    resolve(outputDirectory, 'status.json'),
    JSON.stringify({ complete: false, status: 'running' }),
  );
  for (const file of ['inventory.json', 'summary.md', 'partial.json']) {
    await rm(resolve(outputDirectory, file), { force: true });
  }
  const partial: Record<string, unknown> = {};
  let catalog: unknown = null;
  const server = await startInventoryServer({
    directory: resolve(projectRoot, 'storybook-static'),
    getCatalog: () => catalog,
  });
  const launch = { headless: true as const, args: [] as string[] };
  const contextOptions = {
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light' as const,
    deviceScaleFactor: 1 as const,
    serviceWorkers: 'allow' as const,
  };
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({
      ...launch,
      executablePath: chromium.executablePath(),
    });
    const nativeBundle = await build({
      entryPoints: [
        resolve(projectRoot, 'scripts/compatibility/nativeInventory.ts'),
      ],
      bundle: true,
      format: 'iife',
      globalName: 'inventoryReference',
      write: false,
      platform: 'browser',
      target: 'es2022',
    });
    const referenceContext = await browser.newContext(contextOptions);
    const referencePage = await referenceContext.newPage();
    await referencePage.goto(`${server.origin}/reference.html`, {
      timeout: COLLECTION_TIMEOUT,
    });
    const metadata = await getInventoryEnvironment({
      browser,
      page: referencePage,
      workspaceRoot,
      origin: server.origin,
      launch,
      context: contextOptions,
    });
    partial.metadata = metadata;
    const nativeResult: unknown = await withInventoryTimeout({
      operation: collectNativeInventory({
        page: referencePage,
        source: nativeBundle.outputFiles[0].text,
      }),
      timeout: COLLECTION_TIMEOUT,
      label: 'Native reference collection',
    });
    if (
      !isObject(nativeResult) ||
      !('catalog' in nativeResult) ||
      !('collection' in nativeResult)
    ) {
      throw new Error('Malformed native collection envelope');
    }
    partial.native = nativeResult;
    catalog = inventoryCatalogSchema.parse(nativeResult.catalog);
    const reference = validateInventoryCollection({
      catalog,
      collection: nativeResult.collection,
      runtime: 'reference',
    });
    console.log(`Collected ${reference.targets.length} reference targets`);
    partial.reference = reference;
    partial.catalog = catalog;
    delete partial.native;
    await referenceContext.close();
    const sandboxes = {} as Record<
      'react' | 'preact',
      ReturnType<typeof validateInventoryCollection>
    >;
    for (const runtime of ['react', 'preact'] as const) {
      console.log(`Collecting ${runtime} sandbox inventory`);
      const context = await browser.newContext(contextOptions);
      try {
        const collection = await withInventoryTimeout({
          operation: collectSandboxInventory({
            context,
            origin: server.origin,
            runtime,
            timeout: COLLECTION_TIMEOUT,
          }),
          timeout: COLLECTION_TIMEOUT,
          label: `${runtime} sandbox collection`,
        });
        partial[runtime] = collection;
        sandboxes[runtime] = validateInventoryCollection({
          catalog,
          collection,
          runtime,
        });
      } finally {
        await context.close();
      }
    }
    const report = inventoryReportSchema.parse({
      schemaVersion: 1,
      stage: 'inventory',
      complete: true,
      metadata,
      catalog,
      reference,
      sandboxes,
      findings: (['react', 'preact'] as const).flatMap((runtime) =>
        compareInventoryCollections({
          catalog,
          reference,
          sandbox: sandboxes[runtime],
          runtime,
        }),
      ),
    });
    const summary = summarizeInventoryReport(report);
    await writeFile(
      resolve(outputDirectory, 'inventory.json'),
      JSON.stringify(report),
    );
    await writeFile(resolve(outputDirectory, 'summary.md'), summary);
    await writeFile(
      resolve(outputDirectory, 'status.json'),
      JSON.stringify({
        complete: true,
        status: 'collected',
        collectedAt: report.metadata.collectedAt,
      }),
    );
    console.log(summary);
  } catch (error) {
    await writeFile(
      resolve(outputDirectory, 'partial.json'),
      JSON.stringify(
        {
          schemaVersion: 1,
          stage: 'inventory',
          complete: false,
          launch,
          context: contextOptions,
          error: String(error),
          ...partial,
        },
        null,
        2,
      ),
    );
    await writeFile(
      resolve(outputDirectory, 'status.json'),
      JSON.stringify({
        complete: false,
        status: 'failed',
        error: String(error),
      }),
    );
    throw error;
  } finally {
    await browser?.close();
    await server.close();
  }
};

runInventoryAudit().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
