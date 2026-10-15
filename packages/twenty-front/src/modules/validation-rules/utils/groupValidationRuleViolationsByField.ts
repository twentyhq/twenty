import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';

type GroupedValidationRuleViolations = {
  violationsByFieldMetadataId: Record<string, ValidationRuleViolation[]>;
  recordViolations: ValidationRuleViolation[];
};

export const groupValidationRuleViolationsByField = ({
  violations,
  displayedFieldMetadataItems,
}: {
  violations: ValidationRuleViolation[];
  displayedFieldMetadataItems: Pick<
    FieldMetadataItem,
    'id' | 'relation' | 'morphRelations'
  >[];
}): GroupedValidationRuleViolations =>
  violations.reduce<GroupedValidationRuleViolations>(
    (groupedViolations, violation) => {
      const { fieldMetadataId } = violation;

      const displayedFieldMetadataItem = isDefined(fieldMetadataId)
        ? displayedFieldMetadataItems.find((fieldMetadataItem) =>
            doesFieldMetadataItemMatchFieldMetadataId({
              fieldMetadataItem,
              fieldMetadataId,
            }),
          )
        : undefined;

      if (!isDefined(displayedFieldMetadataItem)) {
        return {
          ...groupedViolations,
          recordViolations: [...groupedViolations.recordViolations, violation],
        };
      }

      const displayedFieldMetadataId = displayedFieldMetadataItem.id;

      return {
        ...groupedViolations,
        violationsByFieldMetadataId: {
          ...groupedViolations.violationsByFieldMetadataId,
          [displayedFieldMetadataId]: [
            ...(groupedViolations.violationsByFieldMetadataId[
              displayedFieldMetadataId
            ] ?? []),
            violation,
          ],
        },
      };
    },
    { violationsByFieldMetadataId: {}, recordViolations: [] },
  );
