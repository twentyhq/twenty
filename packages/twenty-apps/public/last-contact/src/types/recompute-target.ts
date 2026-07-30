import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export type RecomputeTargetName = 'person' | 'company' | 'opportunity';

export type RecomputeTarget = {
  objectNameSingular: RecomputeTargetName;
  objectUniversalIdentifier: string;
};

export const RECOMPUTE_TARGETS: Record<RecomputeTargetName, RecomputeTarget> = {
  person: {
    objectNameSingular: 'person',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  },
  company: {
    objectNameSingular: 'company',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  },
  opportunity: {
    objectNameSingular: 'opportunity',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  },
};

export const isRecomputeTargetName = (
  value: unknown,
): value is RecomputeTargetName =>
  typeof value === 'string' && value in RECOMPUTE_TARGETS;
