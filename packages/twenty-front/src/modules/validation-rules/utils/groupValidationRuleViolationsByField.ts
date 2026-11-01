import { isDefined } from 'twenty-shared/utils';

import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';

type GroupedValidationRuleViolations = {
  violationsByFieldMetadataId: Record<string, ValidationRuleViolation[]>;
  recordViolations: ValidationRuleViolation[];
};

export const groupValidationRuleViolationsByField = ({
  violations,
  displayedFieldMetadataIds,
}: {
  violations: ValidationRuleViolation[];
  displayedFieldMetadataIds: string[];
}): GroupedValidationRuleViolations =>
  violations.reduce<GroupedValidationRuleViolations>(
    (groupedViolations, violation) => {
      const { fieldMetadataId } = violation;

      if (
        !isDefined(fieldMetadataId) ||
        !displayedFieldMetadataIds.includes(fieldMetadataId)
      ) {
        return {
          ...groupedViolations,
          recordViolations: [...groupedViolations.recordViolations, violation],
        };
      }

      return {
        ...groupedViolations,
        violationsByFieldMetadataId: {
          ...groupedViolations.violationsByFieldMetadataId,
          [fieldMetadataId]: [
            ...(groupedViolations.violationsByFieldMetadataId[
              fieldMetadataId
            ] ?? []),
            violation,
          ],
        },
      };
    },
    { violationsByFieldMetadataId: {}, recordViolations: [] },
  );
