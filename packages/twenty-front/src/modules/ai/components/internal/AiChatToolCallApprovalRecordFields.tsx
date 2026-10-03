import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { AiChatToolCallApprovalRecordChip } from '@/ai/components/internal/AiChatToolCallApprovalRecordChip';
import { formatProposedFieldValue } from '@/ai/utils/formatProposedFieldValue';
import { readFieldOptionLabels } from '@/ai/utils/readFieldOptionLabels';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

// approvers read amounts as the currency units the "Currently" line shows, not as micros
const CURRENCY_INPUT_SETTINGS = {
  type: FieldMetadataType.CURRENCY,
  amountUnit: 'units',
} as const;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledCurrentValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
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

  // a many-to-one relation is set through its foreign key
  const fieldDefinitionsByArgumentName = useMemo(
    () =>
      new Map(
        isDefined(objectMetadataItem)
          ? objectMetadataItem.fields.map((field) => {
              const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
                field,
                objectMetadataItem,
                showLabel: true,
                labelWidth: 90,
              });

              return [
                isFieldRelationManyToOne(fieldDefinition)
                  ? `${field.name}Id`
                  : field.name,
                fieldDefinition,
              ] as const;
            })
          : [],
      ),
    [objectMetadataItem],
  );

  return (
    <>
      {Object.entries(values)
        .filter(([fieldName]) => fieldName !== 'id')
        .map(([fieldName, value]) => {
          const fieldDefinition = fieldDefinitionsByArgumentName.get(fieldName);

          if (!isDefined(fieldDefinition)) {
            return (
              <StyledUnknownField key={fieldName}>
                {`${fieldName}: ${JSON.stringify(value)}`}
              </StyledUnknownField>
            );
          }

          const hasCurrentValue =
            isDefined(currentValues) && fieldName in currentValues;
          const currentValue = currentValues?.[fieldName];
          const currentRelatedRecord =
            isFieldRelationManyToOne(fieldDefinition) &&
            isNonEmptyString(currentValue)
              ? {
                  objectNameSingular:
                    fieldDefinition.metadata.relationObjectMetadataNameSingular,
                  recordId: currentValue,
                }
              : null;
          const formattedCurrentValue = hasCurrentValue
            ? (formatProposedFieldValue(
                readFieldOptionLabels(fieldDefinition, currentValue),
                fieldDefinition.type,
              ) ?? t`Empty`)
            : null;

          return (
            <StyledField key={fieldName}>
              <FormFieldInput
                field={fieldDefinition}
                settings={CURRENCY_INPUT_SETTINGS}
                defaultValue={value as JsonValue}
                readonly={readonly}
                onChange={(updatedValue) => onChange(fieldName, updatedValue)}
                onClear={() => onChange(fieldName, null)}
              />
              {isDefined(currentRelatedRecord) ? (
                <StyledCurrentValue>
                  {t`Currently:`}
                  <AiChatToolCallApprovalRecordChip
                    objectNameSingular={currentRelatedRecord.objectNameSingular}
                    recordId={currentRelatedRecord.recordId}
                  />
                </StyledCurrentValue>
              ) : (
                isDefined(formattedCurrentValue) && (
                  <StyledCurrentValue>
                    {t`Currently: ${formattedCurrentValue}`}
                  </StyledCurrentValue>
                )
              )}
            </StyledField>
          );
        })}
    </>
  );
};
