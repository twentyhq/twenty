import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { RecordFormRelationFieldInput } from '@/object-record/record-form/components/RecordFormRelationFieldInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

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

export type RecordFormMorphRelationValue = {
  targetObjectMetadataId: string;
  id: string;
};

type RecordFormMorphRelationFieldInputProps = {
  label?: string;
  morphRelations: FieldMetadataItemRelation[];
  defaultValue?: RecordFormMorphRelationValue | null;
  onChange: (value: RecordFormMorphRelationValue | null) => void;
  onClear?: () => void;
  readonly?: boolean;
};

export const RecordFormMorphRelationFieldInput = ({
  label,
  morphRelations,
  defaultValue,
  onChange,
  onClear,
  readonly,
}: RecordFormMorphRelationFieldInputProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const componentId = useId();

  const canReadObject = (objectMetadataId: string) =>
    objectPermissionsByObjectMetadataId[objectMetadataId]
      ?.canReadObjectRecords === true;

  const readableObjectNameSingulars = [
    ...new Set(
      morphRelations
        .filter((morphRelation) =>
          canReadObject(morphRelation.targetObjectMetadata.id),
        )
        .map(
          (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
        ),
    ),
  ];

  const hasForbiddenSelectedRecord =
    isDefined(defaultValue) &&
    !canReadObject(defaultValue.targetObjectMetadataId);

  const selectedObjectNameSingular = isDefined(defaultValue)
    ? objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === defaultValue.targetObjectMetadataId,
      )?.nameSingular
    : undefined;

  const renderStaticContent = (content: ReactNode) => (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormFieldInputRowContainer>
        <StyledReadonlyContainer>
          <FormFieldInputInnerContainer
            formFieldInputInstanceId={componentId}
            hasRightElement={false}
          >
            {content}
          </FormFieldInputInnerContainer>
        </StyledReadonlyContainer>
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );

  if (hasForbiddenSelectedRecord) {
    return renderStaticContent(
      <StyledForbiddenFieldDisplayContainer>
        <ForbiddenFieldDisplay />
      </StyledForbiddenFieldDisplayContainer>,
    );
  }

  if (readableObjectNameSingulars.length === 0) {
    return renderStaticContent(
      <FormFieldPlaceholder>{t`No record`}</FormFieldPlaceholder>,
    );
  }

  return (
    <RecordFormRelationFieldInput
      label={label}
      objectNameSingulars={readableObjectNameSingulars}
      selectedObjectNameSingular={selectedObjectNameSingular}
      defaultValue={
        defaultValue === null ? null : (defaultValue?.id ?? undefined)
      }
      onChange={(recordId) =>
        onChange(
          isDefined(recordId) && isDefined(defaultValue)
            ? { ...defaultValue, id: recordId }
            : null,
        )
      }
      onMorphItemSelected={(selectedMorphItem) =>
        onChange({
          targetObjectMetadataId: selectedMorphItem.objectMetadataId,
          id: selectedMorphItem.recordId,
        })
      }
      onClear={onClear}
      readonly={readonly}
    />
  );
};
