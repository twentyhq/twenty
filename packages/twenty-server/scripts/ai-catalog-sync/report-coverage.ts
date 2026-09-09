import { type GeneratedCatalog } from './types';

// Models whose job is not general reasoning (speech, image, embeddings,
// computer use, deep research). A capability index for them would be
// meaningless, so they are excluded from the coverage denominator rather than
// counted as gaps.
const SPECIALIZED_MODEL_PATTERN =
  /realtime|voxtral|tts|audio|computer-use|deep-research|-image|pixtral|codestral|embed/;

export type CoverageReport = {
  activeModelCount: number;
  generalPurposeModelCount: number;
  scoredGeneralPurposeModelCount: number;
  unscoredGeneralPurposeModelIds: string[];
  specializedModelIds: string[];
  sourceCounts: Record<string, number>;
};

export const buildCoverageReport = (
  catalog: GeneratedCatalog,
): CoverageReport => {
  const report: CoverageReport = {
    activeModelCount: 0,
    generalPurposeModelCount: 0,
    scoredGeneralPurposeModelCount: 0,
    unscoredGeneralPurposeModelIds: [],
    specializedModelIds: [],
    sourceCounts: {},
  };

  for (const [providerName, provider] of Object.entries(catalog)) {
    for (const model of provider.models) {
      if (model.isDeprecated === true) {
        continue;
      }

      const modelId = `${providerName}/${model.name}`;

      report.activeModelCount += 1;

      for (const source of model.benchmarks?.sources ?? []) {
        report.sourceCounts[source] = (report.sourceCounts[source] ?? 0) + 1;
      }

      if (SPECIALIZED_MODEL_PATTERN.test(model.name)) {
        report.specializedModelIds.push(modelId);
        continue;
      }

      report.generalPurposeModelCount += 1;

      if (model.benchmarks?.intelligenceIndex !== undefined) {
        report.scoredGeneralPurposeModelCount += 1;
      } else {
        report.unscoredGeneralPurposeModelIds.push(modelId);
      }
    }
  }

  return report;
};

const asPercentage = (numerator: number, denominator: number): string =>
  denominator === 0 ? 'n/a' : `${Math.round((numerator / denominator) * 100)}%`;

export const renderCoverageReport = (report: CoverageReport): string => {
  const {
    generalPurposeModelCount: total,
    scoredGeneralPurposeModelCount: scored,
  } = report;

  const lines = [
    '### Benchmark coverage',
    '',
    `- General-purpose models with an intelligence index: **${scored}/${total}** (${asPercentage(scored, total)})`,
    `- Specialized models excluded from the denominator: ${report.specializedModelIds.length}`,
    ...Object.entries(report.sourceCounts).map(
      ([source, count]) => `- Models enriched from \`${source}\`: ${count}`,
    ),
  ];

  if (report.unscoredGeneralPurposeModelIds.length > 0) {
    lines.push(
      '',
      '<details><summary>General-purpose models with no published score</summary>',
      '',
      ...report.unscoredGeneralPurposeModelIds.map((modelId) => `- ${modelId}`),
      '',
      '</details>',
    );
  }

  return lines.join('\n');
};
