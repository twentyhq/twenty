// Projects the canonical catalog through a deployment spec.
//
// `index.ts` keeps one catalog of what every model is, refreshed daily from
// models.dev and Artificial Analysis. A deployment serves a subset of those
// models, through its own routes and credentials, and used to restate them:
// prices, labels and modalities copied by hand into a second file that nothing
// kept in step. Those copies went stale, and the copies that mattered most —
// the effort levels a model takes and the readings measured for it — were never
// made at all, so every deployment served models the product could not compare.
//
// So a deployment declares only what is its own: which routes exist, what
// credentials they use, and which catalog models each one serves. Everything
// that describes a model is read from the catalog at generation time.
//
// This entry point deliberately imports nothing from the workspace, so a
// repository that only needs to generate a catalog can run it straight from a
// sparse checkout without installing the monorepo.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { type CatalogSpec } from './types/catalog-spec.type';
import {
  type CanonicalCatalog,
  projectCatalog,
} from './utils/project-catalog.util';

const DEFAULT_CATALOG_PATH = resolve(
  __dirname,
  '..',
  '..',
  'src',
  'engine',
  'metadata-modules',
  'ai',
  'ai-models',
  'ai-providers.json',
);

const readArgument = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);

  return index === -1 ? undefined : process.argv[index + 1];
};

const readJson = <TValue>(path: string): TValue => {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as TValue;
  } catch (error) {
    throw new Error(
      `Could not read ${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const assertSpecIsUsable = (spec: CatalogSpec, path: string): void => {
  if (!Array.isArray(spec.providers) || spec.providers.length === 0) {
    throw new Error(`${path} declares no providers`);
  }

  for (const provider of spec.providers) {
    if (typeof provider.name !== 'string' || provider.name.length === 0) {
      throw new Error(`${path} has a provider without a name`);
    }

    if (typeof provider.npm !== 'string' || provider.npm.length === 0) {
      throw new Error(
        `${path}: provider "${provider.name}" has no npm package`,
      );
    }

    if (!Array.isArray(provider.models) || provider.models.length === 0) {
      throw new Error(`${path}: provider "${provider.name}" serves no models`);
    }
  }
};

const describe = (catalog: CanonicalCatalog): string => {
  const models = Object.values(catalog).flatMap(
    (provider) => provider.models ?? [],
  );
  const withEfforts = models.filter((model) => model.efforts !== undefined);
  const withBenchmark = models.filter((model) => model.benchmark !== undefined);

  return `${Object.keys(catalog).length} providers, ${models.length} models, ${withEfforts.length} with efforts, ${withBenchmark.length} with a benchmark`;
};

const main = (): void => {
  const specPath = readArgument('--spec');
  const outPath = readArgument('--out');

  if (specPath === undefined || outPath === undefined) {
    throw new Error(
      'Usage: project.ts --spec <spec.json> --out <catalog.json> [--catalog <ai-providers.json>]',
    );
  }

  const catalogPath = readArgument('--catalog') ?? DEFAULT_CATALOG_PATH;
  const spec = readJson<CatalogSpec>(specPath);

  assertSpecIsUsable(spec, specPath);

  const projected = projectCatalog({
    canonicalCatalog: readJson<CanonicalCatalog>(catalogPath),
    spec,
  });

  mkdirSync(dirname(resolve(outPath)), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(projected, null, 2)}\n`, 'utf-8');

  // oxlint-disable-next-line no-console
  console.log(`Wrote ${outPath}: ${describe(projected)}`);
};

try {
  main();
} catch (error) {
  // oxlint-disable-next-line no-console
  console.error(
    `AI catalog projection failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
