import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

import { ONELEET_TRUST_API_URL } from 'src/engine/core-modules/dpa/constants/oneleet-trust.constant';
import {
  type Subprocessor,
  type SubprocessorList,
} from 'src/engine/core-modules/dpa/types/subprocessor.type';

// Shape of the relevant slice of the public Trust Center payload.
type TrustCenterResponse = {
  subprocessors?: Array<{
    name?: string;
    services?: unknown[];
    processingLocations?: unknown[];
    processesPii?: boolean;
    vendorUrl?: string;
  }>;
};

// Normalize into the committed shape: trimmed fields, no empty entries, sorted
// by name so the diff is stable run-to-run.
const normalizeSubprocessors = (
  raw: TrustCenterResponse['subprocessors'],
): Subprocessor[] =>
  (raw ?? [])
    .map((entry) => {
      const subprocessor: Subprocessor = {
        name: (entry.name ?? '').trim(),
        services: (entry.services ?? [])
          .map((service) => String(service).trim())
          .filter(Boolean),
        processingLocations: (entry.processingLocations ?? [])
          .map((location) => String(location).trim())
          .filter(Boolean),
        processesPii: entry.processesPii === true,
      };

      const vendorUrl = (entry.vendorUrl ?? '').trim();

      if (vendorUrl) {
        subprocessor.vendorUrl = vendorUrl;
      }

      return subprocessor;
    })
    .filter((subprocessor) => subprocessor.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

const main = async (): Promise<void> => {
  const dryRun = process.argv.includes('--dry-run');

  // oxlint-disable-next-line no-console
  console.log(`Fetching sub-processors from ${ONELEET_TRUST_API_URL}...`);

  const response = await fetch(ONELEET_TRUST_API_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as TrustCenterResponse;
  const subprocessors = normalizeSubprocessors(data.subprocessors);

  // Guard against an API hiccup silently wiping the committed list.
  if (subprocessors.length === 0) {
    throw new Error(
      'Trust Center returned no sub-processors; refusing to overwrite the list.',
    );
  }

  // oxlint-disable-next-line no-console
  console.log(
    `Found ${subprocessors.length} sub-processors: ${subprocessors
      .map((subprocessor) => subprocessor.name)
      .join(', ')}`,
  );

  const result: SubprocessorList = { subprocessors };
  const json = JSON.stringify(result, null, 2) + '\n';

  if (dryRun) {
    // oxlint-disable-next-line no-console
    console.log('[DRY RUN] Would write subprocessors.json');

    return;
  }

  const outputPath = path.resolve(
    __dirname,
    '..',
    'src',
    'engine',
    'core-modules',
    'dpa',
    'constants',
    'subprocessors.json',
  );

  const prettierConfig = await prettier.resolveConfig(outputPath);

  const formatted = await prettier.format(json, {
    ...prettierConfig,
    filepath: outputPath,
  });

  fs.writeFileSync(outputPath, formatted, 'utf-8');
  // oxlint-disable-next-line no-console
  console.log(`Wrote ${outputPath}`);
};

main().catch((error) => {
  // oxlint-disable-next-line no-console
  console.error('DPA sub-processor sync failed:', error);
  process.exit(1);
});
