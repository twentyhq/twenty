import { isDefined } from 'twenty-shared/utils';

import { type GeneratedCatalog } from './types';

// Models whose job is not general reasoning (speech, image, embeddings,
// computer use, deep research). A capability index for them would be
// meaningless, so they are excluded from the coverage denominator rather than
// counted as gaps.
const SPECIALIZED_MODEL_PATTERN =
  /realtime|voxtral|tts|audio|-live|computer-use|deep-research|-image|pixtral|codestral|embed/;

export type CoverageReport = {
  generalPurposeModelCount: number;
  scoredGeneralPurposeModelCount: number;
  unscoredGeneralPurposeModelIds: string[];
  specializedModelCount: number;
};

export const buildCoverageReport = (
  catalog: GeneratedCatalog,
): CoverageReport => {
  const report: CoverageReport = {
    generalPurposeModelCount: 0,
    scoredGeneralPurposeModelCount: 0,
    unscoredGeneralPurposeModelIds: [],
    specializedModelCount: 0,
  };

  for (const [providerName, provider] of Object.entries(catalog)) {
    for (const model of provider.models) {
      if (model.isDeprecated === true) {
        continue;
      }

      if (SPECIALIZED_MODEL_PATTERN.test(model.name)) {
        report.specializedModelCount += 1;
        continue;
      }

      report.generalPurposeModelCount += 1;

      if (isDefined(model.benchmarks?.intelligenceIndex)) {
        report.scoredGeneralPurposeModelCount += 1;
      } else {
        report.unscoredGeneralPurposeModelIds.push(
          `${providerName}/${model.name}`,
        );
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
    `- Specialized models excluded from the denominator: ${report.specializedModelCount}`,
  ];

  if (report.unscoredGeneralPurposeModelIds.length > 0) {
    lines.push(
      '',
      '<details><summary>General-purpose models with no matched intelligence index</summary>',
      '',
      ...report.unscoredGeneralPurposeModelIds.map((modelId) => `- ${modelId}`),
      '',
      '</details>',
    );
  }

  return lines.join('\n');
};
