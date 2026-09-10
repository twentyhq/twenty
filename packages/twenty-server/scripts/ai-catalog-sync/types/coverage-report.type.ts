export type CoverageReport = {
  generalPurposeModelCount: number;
  scoredGeneralPurposeModelCount: number;
  costedGeneralPurposeModelCount: number;
  unscoredGeneralPurposeModelIds: string[];
  specializedModelCount: number;
  declaredEffortVariantCount: number;
  scoredEffortVariantCount: number;
  unscoredEffortVariantIds: string[];
};
