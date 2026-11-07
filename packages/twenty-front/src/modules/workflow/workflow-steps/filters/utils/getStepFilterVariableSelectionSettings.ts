import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';
import { type FieldMetadataType, type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  computeStepFilterType,
  UNKNOWN_STEP_FILTER_TYPE,
} from 'twenty-shared/workflow';

type StepFilterVariableSelectionSettings = Pick<
  StepFilter,
  | 'stepOutputKey'
  | 'isFullRecord'
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
}): {
  variableSelectionSettings: StepFilterVariableSelectionSettings;
  filterType: string;
} => {
  const filterType =
    isDefined(fieldMetadataId) && !isDefined(fieldMetadataType)
      ? UNKNOWN_STEP_FILTER_TYPE
      : computeStepFilterType({ fieldMetadataType, variableType });

  const [defaultOperand] = getStepFilterOperands({
    filterType,
    subFieldName: compositeFieldSubFieldName,
  });

  return {
    variableSelectionSettings: {
      stepOutputKey: rawVariableName,
      isFullRecord,
      fieldMetadataId,
      compositeFieldSubFieldName,
      operand: defaultOperand,
    },
    filterType,
  };
};
