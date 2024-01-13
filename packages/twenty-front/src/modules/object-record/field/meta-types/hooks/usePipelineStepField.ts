import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { isFieldPipelineStep } from '@/object-record/field/types/guards/isFieldPipelineStep';
import { isFieldPipelineStepValue } from '@/object-record/field/types/guards/isFieldPipelineStepValue';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { FieldPipelineStepValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { usePersistField } from '@/object-record/field/hooks/usePersistField';

export const usePipelineStepField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.PipelineStep,
    isFieldPipelineStep,
    fieldDefinition,
  );

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValue, setFieldValue] = useRecoilState<FieldPipelineStepValue>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );
  const fieldPipelineStepValue = isFieldPipelineStepValue(fieldValue)
    ? fieldValue
    : null;

  const fieldInitialValue = useFieldInitialValue();

  const persistField = usePersistField();


  return {
    fieldDefinition,
    persistField,
    fieldValue: fieldPipelineStepValue,
    initialValue: fieldInitialValue,
    setFieldValue,
    hotkeyScope,
  };
};
