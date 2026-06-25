import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import {
  type RecordId,
  type Variable,
} from '@/object-record/record-field/ui/form-types/types/RecordPickerValue';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { InputLabel } from 'twenty-ui/input';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type JsonValue } from 'type-fest';

const StyledReadonlyContainer = styled.div`
  cursor: default;
  display: flex;
  height: 32px;
  width: 100%;
`;

const StyledForbiddenFieldDisplayContainer = styled.div`
  display: flex;
  margin: ${themeCssVariables.spacing[2]};
`;

export type FormMorphRelationToOneValue =
  | {
      targetObjectMetadataId: string;
      id: string;
    }
  | Variable
  | null;

type FormMorphRelationToOneFieldInputProps = {
  label?: string;
  morphRelations: FieldMetadataItemRelation[];
  defaultValue?: FormMorphRelationToOneValue;
  onChange: (value: JsonValue) => void;
  onClear?: () => void;
  readonly?: boolean;
  testId?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormMorphRelationToOneFieldInput = ({
  label,
  morphRelations,
  defaultValue,
  onChange,
  onClear,
  readonly,
  testId,
  VariablePicker,
}: FormMorphRelationToOneFieldInputProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const componentId = useId();

  const readableObjectNameSingulars = [
    ...new Set(
      morphRelations
        .filter(
          (morphRelation) =>
            objectPermissionsByObjectMetadataId[
              morphRelation.targetObjectMetadata.id
            ]?.canReadObjectRecords === true,
        )
        .map(
          (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
        ),
    ),
  ];

  const selectedMorphValue =
    isDefined(defaultValue) && !isString(defaultValue) ? defaultValue : null;

  const recordIdOrVariable: RecordId | Variable | null | undefined = isString(
    defaultValue,
  )
    ? defaultValue
    : isDefined(defaultValue)
      ? defaultValue.id
      : defaultValue;

  const selectedTargetIsReadable =
    !isDefined(selectedMorphValue) ||
    objectPermissionsByObjectMetadataId[
      selectedMorphValue.targetObjectMetadataId
    ]?.canReadObjectRecords === true;

  const hasForbiddenSelectedRecord =
    isDefined(selectedMorphValue) && !selectedTargetIsReadable;

  const selectedObjectMetadataItem = isDefined(selectedMorphValue)
    ? objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === selectedMorphValue.targetObjectMetadataId,
      )
    : undefined;

  const selectedObjectNameSingular =
    selectedObjectMetadataItem?.nameSingular ?? readableObjectNameSingulars[0];

  if (hasForbiddenSelectedRecord) {
    return (
      <FormFieldInputContainer data-testid={testId}>
        {label ? <InputLabel>{label}</InputLabel> : null}
        <FormFieldInputRowContainer>
          <StyledReadonlyContainer>
            <FormFieldInputInnerContainer
              formFieldInputInstanceId={componentId}
              hasRightElement={false}
            >
              <StyledForbiddenFieldDisplayContainer>
                <ForbiddenFieldDisplay />
              </StyledForbiddenFieldDisplayContainer>
            </FormFieldInputInnerContainer>
          </StyledReadonlyContainer>
        </FormFieldInputRowContainer>
      </FormFieldInputContainer>
    );
  }

  if (readableObjectNameSingulars.length === 0) {
    return (
      <FormFieldInputContainer data-testid={testId}>
        {label ? <InputLabel>{label}</InputLabel> : null}
        <FormFieldInputRowContainer>
          <StyledReadonlyContainer>
            <FormFieldInputInnerContainer
              formFieldInputInstanceId={componentId}
              hasRightElement={false}
            >
              <FormFieldPlaceholder>{t`No record`}</FormFieldPlaceholder>
            </FormFieldInputInnerContainer>
          </StyledReadonlyContainer>
        </FormFieldInputRowContainer>
      </FormFieldInputContainer>
    );
  }

  return (
    <FormSingleRecordPicker
      label={label}
      testId={testId}
      defaultValue={recordIdOrVariable}
      objectNameSingulars={readableObjectNameSingulars}
      selectedObjectNameSingular={selectedObjectNameSingular}
      onChange={onChange}
      onClear={onClear}
      onMorphItemSelected={(selectedMorphItem) =>
        onChange({
          targetObjectMetadataId: selectedMorphItem.objectMetadataId,
          id: selectedMorphItem.recordId,
        })
      }
      disabled={readonly}
      VariablePicker={VariablePicker}
    />
  );
};
