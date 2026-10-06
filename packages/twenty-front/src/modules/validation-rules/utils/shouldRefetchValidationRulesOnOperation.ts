import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';

export const shouldRefetchValidationRulesOnOperation = ({
  operation,
  objectMetadataId,
  validationRules,
}: {
  operation: MetadataOperation<ValidationRule>;
  objectMetadataId: string;
  validationRules: ValidationRule[];
}): boolean => {
  switch (operation.type) {
    case 'create':
      return operation.createdRecord.objectMetadataId === objectMetadataId;
    case 'update':
      return operation.updatedRecord.objectMetadataId === objectMetadataId;
    case 'delete':
      return validationRules.some(
        (validationRule) => validationRule.id === operation.deletedRecordId,
      );
  }
};
