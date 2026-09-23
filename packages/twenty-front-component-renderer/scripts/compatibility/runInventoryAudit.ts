import { build } from 'esbuild';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from 'playwright';

import { isObject } from '@sniptt/guards';
import { type z } from 'zod';
import { inventoryCatalogSchema } from './schemas/inventoryCatalogSchema';
import { type inventoryCollectionSchema } from './schemas/inventoryCollectionSchema';
import { type inventoryReportSchema } from './schemas/inventoryReportSchema';
import { inventorySandboxRuntimeSchema } from './schemas/inventorySandboxRuntimeSchema';
import { type InventorySandboxRuntime } from './types/InventorySandboxRuntime';
import { assertInventoryStorybookBuild } from './utils/assertInventoryStorybookBuild';
import { collectNativeInventory } from './utils/collectNativeInventory';
import { collectSandboxInventory } from './utils/collectSandboxInventory';
import { compareInventoryCollections } from './utils/compareInventoryCollections';
import { getInventoryEnvironment } from './utils/getInventoryEnvironment';
import { mergeInventoryFindings } from './utils/mergeInventoryFindings';
import { startInventoryServer } from './utils/startInventoryServer';
import { summarizeInventoryReport } from './utils/summarizeInventoryReport';
import { withInventoryTimeout } from './utils/withInventoryTimeout';
import { validateInventoryCollection } from './utils/validateInventoryCollection';

type InventoryCatalog = z.infer<typeof inventoryCatalogSchema>;
type InventoryCollection = z.infer<typeof inventoryCollectionSchema>;

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const workspaceRoot = resolve(projectRoot, '../..');
const outputDirectory = resolve(projectRoot, 'compatibility-results');
const storybookDirectory = resolve(projectRoot, 'storybook-static');
const COLLECTION_TIMEOUT = 60_000;
const SUPERVISOR_GRACE_PERIOD = 15_000;
const LAUNCH_OPTIONS = { headless: true as const, args: [] as string[] };
const CONTEXT_OPTIONS = {
  viewport: { width: 1280, height: 720 },
  locale: 'en-US',
  timezoneId: 'UTC',
  colorScheme: 'light' as const,
  deviceScaleFactor: 1 as const,
  serviceWorkers: 'allow' as const,
};

const collectValidatedSandboxInventory = async ({
  browser,
  origin,
  catalog,
  runtime,
  partial,
}: {
  browser: Browser;
  origin: string;
  catalog: InventoryCatalog;
  runtime: InventorySandboxRuntime;
  partial: Record<string, unknown>;
}) => {
  console.log(`Collecting ${runtime} sandbox inventory`);
  const context = await browser.newContext(CONTEXT_OPTIONS);
  try {
    const collection = await withInventoryTimeout({
      operation: collectSandboxInventory({
        context,
        origin,
        runtime,
        timeout: COLLECTION_TIMEOUT,
      }),
      timeout: COLLECTION_TIMEOUT + SUPERVISOR_GRACE_PERIOD,
      label: `${runtime} sandbox collection`,
    });
    partial[runtime] = collection;
    return validateInventoryCollection({ catalog, collection, runtime });
  } finally {
    await context.close();
  }
};

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
  let servedCatalog: InventoryCatalog | null = null;
  let server: Awaited<ReturnType<typeof startInventoryServer>> | undefined;
  let browser: Browser | undefined;
  try {
    await assertInventoryStorybookBuild(storybookDirectory);
    server = await startInventoryServer({
      directory: storybookDirectory,
      getCatalog: () => servedCatalog,
    });
    browser = await chromium.launch({
      ...LAUNCH_OPTIONS,
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
    const referenceContext = await browser.newContext(CONTEXT_OPTIONS);
    const referencePage = await referenceContext.newPage();
    await referencePage.goto(`${server.origin}/reference.html`, {
      timeout: COLLECTION_TIMEOUT,
    });
    const metadata = await getInventoryEnvironment({
      browser,
      page: referencePage,
      workspaceRoot,
      origin: server.origin,
      launch: LAUNCH_OPTIONS,
      context: CONTEXT_OPTIONS,
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
    partial.catalog = nativeResult.catalog;
    partial.reference = nativeResult.collection;
    const catalog = inventoryCatalogSchema.parse(nativeResult.catalog);
    const reference = validateInventoryCollection({
      catalog,
      collection: nativeResult.collection,
      runtime: 'reference',
    });
    console.log(`Collected ${reference.targets.length} reference targets`);
    servedCatalog = catalog;
    await referenceContext.close();
    const sandboxes: Record<InventorySandboxRuntime, InventoryCollection> = {
      react: await collectValidatedSandboxInventory({
        browser,
        origin: server.origin,
        catalog,
        runtime: 'react',
        partial,
      }),
      preact: await collectValidatedSandboxInventory({
        browser,
        origin: server.origin,
        catalog,
        runtime: 'preact',
        partial,
      }),
    };
    const report: z.infer<typeof inventoryReportSchema> = {
      schemaVersion: 1,
      stage: 'inventory',
      complete: true,
      metadata,
      catalog,
      reference,
      sandboxes,
      findings: mergeInventoryFindings(
        inventorySandboxRuntimeSchema.options.flatMap((runtime) =>
          compareInventoryCollections({
            reference,
            sandbox: sandboxes[runtime],
            runtime,
          }),
        ),
      ),
    };
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
        collectedAt: metadata.collectedAt,
        commit: metadata.commit,
        isWorkingTreeDirty: metadata.isWorkingTreeDirty,
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
          launch: LAUNCH_OPTIONS,
          context: CONTEXT_OPTIONS,
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
    await Promise.allSettled([browser?.close(), server?.close()]);
  }
};

runInventoryAudit().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
