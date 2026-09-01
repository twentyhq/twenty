import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';
import { FieldMetadataType, type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
  let filterType = variableType ?? 'unknown';

  if (isDefined(fieldMetadataId) && isDefined(fieldMetadataType)) {
    filterType =
      fieldMetadataType === FieldMetadataType.MORPH_RELATION
        ? FieldMetadataType.RELATION
        : fieldMetadataType;
  } else if (isDefined(fieldMetadataId)) {
    filterType = 'unknown';
  }

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
