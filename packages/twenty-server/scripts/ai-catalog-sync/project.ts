// Projects the canonical catalog through a deployment spec. See README.md.
//
// This entry point and the files it imports deliberately use nothing from the
// workspace, so a repository holding a private spec can run them straight from
// a sparse checkout without installing the monorepo.

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

// A flag whose value is missing would otherwise swallow the next flag and write
// the catalog to a file named after it.
const readArgument = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  const value = process.argv[index + 1];

  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${flag} is missing its value`);
  }

  return value;
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

const assertSpecIsUsable = ({
  spec,
  path,
}: {
  spec: CatalogSpec;
  path: string;
}): void => {
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

  assertSpecIsUsable({ spec, path: specPath });

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
