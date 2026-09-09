import Papa from 'papaparse';
import * as unzipper from 'unzipper';

import { isDefined } from 'twenty-shared/utils';

import { normalizeModelName } from './normalize-model-name.util';
import { type BenchmarkIndex, type BenchmarkRecord } from './types';

const EPOCH_BENCHMARK_DATA_URL = 'https://epoch.ai/data/benchmark_data.zip';
const ECI_SCORES_ENTRY = 'epoch_capabilities_index/eci_scores.csv';
const MODEL_METADATA_ENTRY = 'model_metadata.csv';

// Trailing `_max`, `_high`, `_32K` mark the harness configuration Epoch ran,
// which the capabilities index already aggregates over.
const HARNESS_SUFFIX = /_[^_]*$/;

type EciScoreRow = {
  Model: string;
  'Display name': string;
  eci: string;
  date: string;
};

type ModelMetadataRow = {
  model_version: string;
  model_group: string;
  display_name: string;
};

type AliasClaim = {
  record: BenchmarkRecord;
  releaseDate: string;
  // A claim from a provider-shaped model id (`gpt-4o-2024-08-06`) names exactly
  // one release; a claim from a display name ("GPT-4o (Aug 2024)") loses its
  // date to normalization and collides with its siblings.
  isModelId: boolean;
};

const parseCsv = <TRow>(content: string): TRow[] =>
  Papa.parse<TRow>(content, { header: true, skipEmptyLines: true }).data;

const readZipEntries = async (
  url: string,
  entryPaths: string[],
): Promise<Record<string, string>> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const archive = await unzipper.Open.buffer(
    Buffer.from(await response.arrayBuffer()),
  );

  const contents: Record<string, string> = {};

  for (const entryPath of entryPaths) {
    const entry = archive.files.find((file) => file.path === entryPath);

    if (!isDefined(entry)) {
      throw new Error(`Missing "${entryPath}" in ${url}`);
    }

    contents[entryPath] = (await entry.buffer()).toString('utf-8');
  }

  return contents;
};

const claimAlias = (
  claims: Map<string, AliasClaim[]>,
  alias: string,
  claim: AliasClaim,
): void => {
  const key = normalizeModelName(alias);

  if (key.length === 0) {
    return;
  }

  claims.set(key, [...(claims.get(key) ?? []), claim]);
};

// An undated model name serves whatever release the provider currently points
// it at, so the newest claim wins; an exact model id always beats a display
// name that normalized down to the same key.
const resolveClaim = (claims: AliasClaim[]): BenchmarkRecord => {
  const modelIdClaims = claims.filter((claim) => claim.isModelId);
  const preferred = modelIdClaims.length > 0 ? modelIdClaims : claims;

  return preferred.reduce((newest, claim) =>
    claim.releaseDate.localeCompare(newest.releaseDate) > 0 ? claim : newest,
  ).record;
};

export const fetchEpochBenchmarks = async (): Promise<BenchmarkIndex> => {
  const entries = await readZipEntries(EPOCH_BENCHMARK_DATA_URL, [
    ECI_SCORES_ENTRY,
    MODEL_METADATA_ENTRY,
  ]);

  const claims = new Map<string, AliasClaim[]>();
  const recordsByGroup = new Map<
    string,
    { record: BenchmarkRecord; releaseDate: string }
  >();

  for (const row of parseCsv<EciScoreRow>(entries[ECI_SCORES_ENTRY])) {
    const intelligenceIndex = Number.parseFloat(row.eci);

    if (!Number.isFinite(intelligenceIndex)) {
      continue;
    }

    const group = {
      record: { intelligenceIndex, aliases: [] },
      releaseDate: row.date ?? '',
    };

    recordsByGroup.set(row.Model, group);

    for (const alias of [row['Display name'], row.Model]) {
      claimAlias(claims, alias, { ...group, isModelId: false });
    }
  }

  // model_metadata is Epoch's crosswalk from provider-shaped model ids to the
  // scored group, and is what lifts coverage past display-name matching.
  for (const row of parseCsv<ModelMetadataRow>(entries[MODEL_METADATA_ENTRY])) {
    const group = recordsByGroup.get(row.model_group);

    if (!isDefined(group)) {
      continue;
    }

    const modelId = row.model_version.replace(HARNESS_SUFFIX, '');

    if (!group.record.aliases.includes(modelId)) {
      group.record.aliases.push(modelId);
    }

    claimAlias(claims, modelId, { ...group, isModelId: true });
    claimAlias(claims, row.display_name, { ...group, isModelId: false });
  }

  return new Map(
    [...claims].map(([key, aliasClaims]) => [key, resolveClaim(aliasClaims)]),
  );
};
