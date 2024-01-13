import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { isFieldPipelineSteps } from '@/object-record/field/types/guards/isFieldPipelineSteps';
import { isFieldPipelineStepsValue } from '@/object-record/field/types/guards/isFieldPipelineStepsValue';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldPipelineStepsValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const usePipelineStepsField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.PipelineSteps,
    isFieldPipelineSteps,
    fieldDefinition,
  );

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValue, setFieldValue] = useRecoilState<FieldPipelineStepsValue>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );
  const fieldPipelineStepsValue = isFieldPipelineStepsValue(fieldValue)
    ? fieldValue
    : { color: 'green' as ThemeColor, label: '' };

  const fieldInitialValue = useFieldInitialValue();

  const initialValue = {
    color: 'green' as ThemeColor,
    label: fieldInitialValue?.isEmpty
      ? ''
      : fieldInitialValue?.value ?? fieldPipelineStepsValue?.label ?? '',
  };

  return {
    fieldDefinition,
    fieldValue: fieldPipelineStepsValue,
    initialValue,
    setFieldValue,
    hotkeyScope,
  };
};
