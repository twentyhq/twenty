import { type CoverageReport } from '../types/coverage-report.type';

const asPercentage = ({
  numerator,
  denominator,
}: {
  numerator: number;
  denominator: number;
}): string =>
  denominator === 0 ? 'n/a' : `${Math.round((numerator / denominator) * 100)}%`;

const renderGapList = ({
  summary,
  modelIds,
}: {
  summary: string;
  modelIds: string[];
}): string[] =>
  modelIds.length === 0
    ? []
    : [
        '',
        `<details><summary>${summary}</summary>`,
        '',
        ...modelIds.map((modelId) => `- ${modelId}`),
        '',
        '</details>',
      ];

export const renderCoverageReport = (report: CoverageReport): string => {
  const {
    generalPurposeModelCount: total,
    scoredGeneralPurposeModelCount: scored,
    costedGeneralPurposeModelCount: costed,
    declaredEffortVariantCount: declaredVariants,
    scoredEffortVariantCount: scoredVariants,
  } = report;

  return [
    '### Benchmark coverage',
    '',
    `- General-purpose models with an intelligence index: **${scored}/${total}** (${asPercentage({ numerator: scored, denominator: total })})`,
    `- Declared effort variants with an index measured at their own effort: **${scoredVariants}/${declaredVariants}** (${asPercentage({ numerator: scoredVariants, denominator: declaredVariants })})`,
    `- General-purpose models with a cost per task: **${costed}/${total}** (${asPercentage({ numerator: costed, denominator: total })})`,
    `- Specialized models excluded from the denominator: ${report.specializedModelCount}`,
    ...renderGapList({
      summary: 'General-purpose models with no matched intelligence index',
      modelIds: report.unscoredGeneralPurposeModelIds,
    }),
    ...renderGapList({
      summary: 'Effort variants with no reading at their own effort',
      modelIds: report.unscoredEffortVariantIds,
    }),
  ].join('\n');
};
