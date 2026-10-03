import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { formatProposedFieldValue } from '@/ai/utils/formatProposedFieldValue';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { RelationType } from '~/generated-metadata/graphql';

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledCurrentValue = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

const StyledUnknownField = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

type AiChatToolCallApprovalRecordFieldsProps = {
  objectNameSingular: string;
  values: Record<string, unknown>;
  currentValues?: Record<string, unknown>;
  readonly: boolean;
  onChange: (fieldName: string, value: JsonValue) => void;
};

export const AiChatToolCallApprovalRecordFields = ({
  objectNameSingular,
  values,
  currentValues,
  readonly,
  onChange,
}: AiChatToolCallApprovalRecordFieldsProps) => {
  const { t } = useLingui();
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    { objectName: objectNameSingular, objectNameType: 'singular' },
  );

  const fieldDefinitions = isDefined(objectMetadataItem)
    ? objectMetadataItem.fields.map((field) =>
        formatFieldMetadataItemAsFieldDefinition({
          field,
          objectMetadataItem,
          showLabel: true,
          labelWidth: 90,
        }),
      )
    : [];

  // a many-to-one relation is set through its foreign key
  const findFieldDefinition = (fieldName: string) =>
    fieldDefinitions.find((fieldDefinition) =>
      isFieldRelation(fieldDefinition) &&
      fieldDefinition.metadata.relationType === RelationType.MANY_TO_ONE
        ? `${fieldDefinition.metadata.fieldName}Id` === fieldName
        : fieldDefinition.metadata.fieldName === fieldName,
    );

  return (
    <>
      {Object.entries(values)
        .filter(([fieldName]) => fieldName !== 'id')
        .map(([fieldName, value]) => {
          const fieldDefinition = findFieldDefinition(fieldName);
          const hasCurrentValue =
            isDefined(currentValues) && fieldName in currentValues;
          const formattedCurrentValue = hasCurrentValue
            ? (formatProposedFieldValue(currentValues[fieldName]) ?? t`Empty`)
            : null;

          if (!isDefined(fieldDefinition)) {
            return (
              <StyledUnknownField key={fieldName}>
                {`${fieldName}: ${JSON.stringify(value)}`}
              </StyledUnknownField>
            );
          }

          return (
            <StyledField key={fieldName}>
              <FormFieldInput
                field={fieldDefinition}
                defaultValue={value as JsonValue}
                readonly={readonly}
                onChange={(updatedValue) => onChange(fieldName, updatedValue)}
                onClear={() => onChange(fieldName, null)}
              />
              {isDefined(formattedCurrentValue) && (
                <StyledCurrentValue>
                  {t`Currently: ${formattedCurrentValue}`}
                </StyledCurrentValue>
              )}
            </StyledField>
          );
        })}
    </>
  );
};
