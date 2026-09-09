import { type CoverageReport } from '../types/coverage-report.type';

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
