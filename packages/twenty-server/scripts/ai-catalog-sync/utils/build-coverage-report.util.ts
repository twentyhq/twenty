import { isDefined } from 'twenty-shared/utils';

import { type CoverageReport } from '../types/coverage-report.type';
import { type GeneratedCatalog } from '../types/generated-catalog.type';

// Models whose job is not general reasoning (speech, image, embeddings,
// computer use, deep research). A capability index for them would be
// meaningless, so they are excluded from the coverage denominator rather than
// counted as gaps.
const SPECIALIZED_MODEL_PATTERN =
  /realtime|voxtral|tts|audio|-live|computer-use|deep-research|-image|pixtral|codestral|embed/;

export const buildCoverageReport = (
  catalog: GeneratedCatalog,
): CoverageReport => {
  const report: CoverageReport = {
    generalPurposeModelCount: 0,
    scoredGeneralPurposeModelCount: 0,
    costedGeneralPurposeModelCount: 0,
    unscoredGeneralPurposeModelIds: [],
    specializedModelCount: 0,
    declaredEffortVariantCount: 0,
    scoredEffortVariantCount: 0,
    unscoredEffortVariantIds: [],
  };

  for (const [providerName, provider] of Object.entries(catalog)) {
    for (const model of provider.models) {
      if (model.isDeprecated) {
        continue;
      }

      if (SPECIALIZED_MODEL_PATTERN.test(model.name)) {
        report.specializedModelCount += 1;
        continue;
      }

      report.generalPurposeModelCount += 1;

      if (isDefined(model.benchmark?.costPerTask)) {
        report.costedGeneralPurposeModelCount += 1;
      }

      if (isDefined(model.benchmark?.intelligenceIndex)) {
        report.scoredGeneralPurposeModelCount += 1;
      } else {
        report.unscoredGeneralPurposeModelIds.push(
          `${providerName}/${model.name}`,
        );
      }

      for (const effort of model.efforts ?? []) {
        report.declaredEffortVariantCount += 1;

        if (isDefined(model.benchmarkByEffort?.[effort]?.intelligenceIndex)) {
          report.scoredEffortVariantCount += 1;
        } else {
          report.unscoredEffortVariantIds.push(
            `${providerName}/${model.name}@${effort}`,
          );
        }
      }
    }
  }

  return report;
};
