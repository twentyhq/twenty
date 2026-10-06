import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Optional members default to null on both sides so an absent and an explicit null compare equal.
export const areDashboardFilterBindingsEqual = (
  bindingA: DashboardFilterBinding | null | undefined,
  bindingB: DashboardFilterBinding | null | undefined,
): boolean => {
  if (!isDefined(bindingA) || !isDefined(bindingB)) {
    return !isDefined(bindingA) && !isDefined(bindingB);
  }

  return (
    bindingA.fieldMetadataId === bindingB.fieldMetadataId &&
    (bindingA.subFieldName ?? null) === (bindingB.subFieldName ?? null) &&
    (bindingA.relationTargetFieldMetadataId ?? null) ===
      (bindingB.relationTargetFieldMetadataId ?? null)
  );
};
