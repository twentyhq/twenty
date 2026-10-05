import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { isDefined } from 'twenty-shared/utils';

export const shouldRefetchValidationRulesOnOperation = ({
  operation,
  objectMetadataId,
  validationRules,
}: {
  operation: MetadataOperation<ValidationRule>;
  objectMetadataId: string;
  validationRules: ValidationRule[];
}): boolean => {
  if (operation.type === 'delete') {
    return validationRules.some(
      (validationRule) => validationRule.id === operation.deletedRecordId,
    );
  }

  const operationRecord =
    operation.type === 'create'
      ? operation.createdRecord
      : operation.updatedRecord;

  if (operationRecord.objectMetadataId !== objectMetadataId) {
    return false;
  }

  const loadedValidationRule = validationRules.find(
    (validationRule) => validationRule.id === operationRecord.id,
  );

  if (!isDefined(loadedValidationRule)) {
    return true;
  }

  return Object.entries(loadedValidationRule).some(
    ([fieldName, loadedValue]) =>
      fieldName !== '__typename' &&
      operationRecord[fieldName as keyof ValidationRule] !== loadedValue,
  );
};
