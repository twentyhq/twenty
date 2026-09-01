import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';
import { type FieldMetadataType, type StepFilter } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

type StepFilterVariableSelectionSettings = Pick<
  StepFilter,
  | 'stepOutputKey'
  | 'isFullRecord'
  | 'type'
  | 'fieldMetadataId'
  | 'compositeFieldSubFieldName'
  | 'operand'
>;

export const getStepFilterVariableSelectionSettings = ({
  rawVariableName,
  isFullRecord,
  variableType,
  fieldMetadataId,
  fieldMetadataType,
  compositeFieldSubFieldName,
}: {
  rawVariableName: string;
  isFullRecord: boolean;
  variableType: string | undefined;
  fieldMetadataId: string | undefined;
  fieldMetadataType: FieldMetadataType | undefined;
  compositeFieldSubFieldName: string | undefined;
}): StepFilterVariableSelectionSettings => {
  const filterType = isDefined(fieldMetadataId)
    ? isDefined(fieldMetadataType)
      ? getFilterTypeFromFieldType(fieldMetadataType)
      : 'unknown'
    : (variableType ?? 'unknown');
  const [defaultOperand] = getStepFilterOperands({
    filterType,
    subFieldName: compositeFieldSubFieldName,
  });

  return {
    stepOutputKey: rawVariableName,
    isFullRecord,
    type: filterType,
    fieldMetadataId,
    compositeFieldSubFieldName,
    operand: defaultOperand,
  };
};
