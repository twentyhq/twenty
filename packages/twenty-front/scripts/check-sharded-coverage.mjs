/* oxlint-disable no-console */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const COVERAGE_FILE_NAME = 'coverage-final.json';

const findCoverageFiles = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const entryPath = join(directory, entry);

    if (statSync(entryPath).isDirectory()) {
      return findCoverageFiles(entryPath);
    }

    return entry === COVERAGE_FILE_NAME ? [entryPath] : [];
  });

const addHitCounts = (target, source) => {
  for (const [key, count] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + count;
  }
};

const hasHits = (fileCoverage) =>
  Object.values(fileCoverage.s).some((count) => count > 0);

const pickExecutedCoverageVariant = (variants) =>
  variants.find(hasHits) ?? variants[0];

const mergeCoverageFiles = (coverageFiles) => {
  const coverageVariantsByFile = {};

  for (const coverageFile of coverageFiles) {
    const shardCoverage = JSON.parse(readFileSync(coverageFile, 'utf8'));

    for (const [filePath, fileCoverage] of Object.entries(shardCoverage)) {
      const variantKey = JSON.stringify(fileCoverage.statementMap);

      coverageVariantsByFile[filePath] ??= {};
      coverageVariantsByFile[filePath][variantKey] ??= {
        statementMap: fileCoverage.statementMap,
        s: {},
        f: {},
      };

      const variant = coverageVariantsByFile[filePath][variantKey];

      addHitCounts(variant.s, fileCoverage.s);
      addHitCounts(variant.f, fileCoverage.f);
    }
  }

  return Object.fromEntries(
    Object.entries(coverageVariantsByFile).map(([filePath, variants]) => [
      filePath,
      pickExecutedCoverageVariant(Object.values(variants)),
    ]),
  );
};

const countCovered = (hitCounts) => ({
  total: hitCounts.length,
  covered: hitCounts.filter((count) => count > 0).length,
});

const getLineHitCounts = ({ statementMap, s }) => {
  const hitCountByLine = {};

  for (const [statementId, count] of Object.entries(s)) {
    const { line } = statementMap[statementId].start;

    hitCountByLine[line] = Math.max(hitCountByLine[line] ?? 0, count);
  }

  return Object.values(hitCountByLine);
};

const computeSummary = (mergedCoverage) => {
  const files = Object.values(mergedCoverage);

  return {
    statements: countCovered(files.flatMap((file) => Object.values(file.s))),
    functions: countCovered(files.flatMap((file) => Object.values(file.f))),
    lines: countCovered(files.flatMap(getLineHitCounts)),
  };
};

const toPercentage = ({ total, covered }) =>
  total === 0 ? 100 : Math.floor((covered / total) * 10000) / 100;

const [coverageDirectory, jestConfigPath] = process.argv.slice(2);
const coverageFiles = findCoverageFiles(coverageDirectory);

if (coverageFiles.length === 0) {
  console.log('No coverage reports found, skipping threshold check.');
  process.exit(0);
}

const { default: jestConfig } = await import(
  pathToFileURL(resolve(jestConfigPath)).href
);
const summary = computeSummary(mergeCoverageFiles(coverageFiles));
const globalThreshold = jestConfig.coverageThreshold.global;

const failedMetrics = Object.entries(globalThreshold).filter(
  ([metric, threshold]) => toPercentage(summary[metric]) < threshold,
);

for (const [metric, threshold] of Object.entries(globalThreshold)) {
  console.log(
    `${metric}: ${toPercentage(summary[metric])}% (threshold ${threshold}%)`,
  );
}

if (failedMetrics.length > 0) {
  console.error(
    `Coverage below threshold for ${failedMetrics.map(([metric]) => metric).join(', ')} across ${coverageFiles.length} shards.`,
  );
  process.exit(1);
}
