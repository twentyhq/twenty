import { type KeyboardEvent, useCallback, useMemo, useState } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isUpdateRecordValueEmpty } from '@/object-record/record-update-multiple/utils/isUpdateRecordValueEmpty';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { createRecordObjectMetadataItemIdComponentState } from '@/side-panel/pages/create-record/states/createRecordObjectMetadataItemIdComponentState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useViewOrDefaultView } from '@/views/hooks/useViewOrDefaultView';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isObjectMetadataManuallyCreatable } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getOsControlSymbol } from 'twenty-ui/utilities';
import { type JsonValue } from 'type-fest';

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const StyledSectionContainer = styled.div`
  flex: 1;

  > * {
    display: flex;
    flex-direction: column;
    gap: ${themeCssVariables.spacing[6]};
    padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
    width: auto;
  }
`;

const StyledFooterContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  bottom: 0;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
  position: sticky;
`;

export const SidePanelCreateRecordPage = () => {
  const createRecordObjectMetadataItemId = useAtomComponentStateValue(
    createRecordObjectMetadataItemIdComponentState,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === createRecordObjectMetadataItemId,
  );

  if (!objectMetadataItem) {
    throw new Error('Object metadata item is required to create a record');
  }

  if (!isObjectMetadataManuallyCreatable(objectMetadataItem)) {
    throw new Error(
      `Object ${objectMetadataItem.nameSingular} cannot be manually created`,
    );
  }

  return <SidePanelCreateRecordForm objectMetadataItem={objectMetadataItem} />;
};

const SidePanelCreateRecordForm = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const [formValues, setFormValues] = useState<Partial<ObjectRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { view: indexView } = useViewOrDefaultView({
    objectMetadataItemId: objectMetadataItem.id,
  });

  const fieldsWithDefinitions = useMemo(
    () =>
      objectMetadataItem.fields
        .map((fieldMetadataItem, metadataFieldPosition) => {
          const viewField = indexView?.viewFields.find(
            (viewField) => viewField.fieldMetadataId === fieldMetadataItem.id,
          );

          return {
            fieldMetadataItem,
            metadataFieldPosition,
            viewFieldPosition: viewField?.position,
          };
        })
        .filter(({ fieldMetadataItem }) =>
          shouldDisplayFormField({
            fieldMetadataItem,
            actionType: 'CREATE_RECORD',
          }),
        )
        .sort((fieldA, fieldB) => {
          if (
            isDefined(fieldA.viewFieldPosition) &&
            isDefined(fieldB.viewFieldPosition)
          ) {
            return fieldA.viewFieldPosition - fieldB.viewFieldPosition;
          }

          if (isDefined(fieldA.viewFieldPosition)) {
            return -1;
          }

          if (isDefined(fieldB.viewFieldPosition)) {
            return 1;
          }

          return fieldA.metadataFieldPosition - fieldB.metadataFieldPosition;
        })
        .map(({ fieldMetadataItem }) => ({
          fieldMetadataItem,
          fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
            field: fieldMetadataItem,
            objectMetadataItem,
            showLabel: true,
            labelWidth: 90,
          }),
        })),
    [indexView?.viewFields, objectMetadataItem],
  );

  const updateFormValue = (fieldName: string, value: unknown) => {
    setFormValues((previousValues) => {
      const nextValues = { ...previousValues };

      if (value === undefined) {
        delete nextValues[fieldName];
      } else {
        nextValues[fieldName] = value;
      }

      return nextValues;
    });
  };

  const handleSave = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createdRecord = await createOneRecord(formValues);

      openRecordInSidePanel({
        recordId: createdRecord.id,
        objectNameSingular: objectMetadataItem.nameSingular,
        resetNavigationStack: true,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message: error instanceof Error ? error.message : t`An error occurred.`,
      });
      setIsSubmitting(false);
    }
  }, [
    createOneRecord,
    enqueueErrorSnackBar,
    formValues,
    isSubmitting,
    objectMetadataItem.nameSingular,
    openRecordInSidePanel,
    t,
  ]);

  const handleFormKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const isSubmitShortcut =
        (event.metaKey || event.ctrlKey) &&
        (event.key === 'Enter' || event.code === 'NumpadEnter');

      if (!isSubmitShortcut) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();

      if (!isSubmitting) {
        handleSave();
      }
    },
    [handleSave, isSubmitting],
  );

  return (
    <StyledPage onKeyDownCapture={handleFormKeyDown}>
      <StyledSectionContainer>
        <Section>
          {fieldsWithDefinitions.map(
            ({ fieldMetadataItem, fieldDefinition }) => {
              const fieldName = fieldDefinition.metadata.fieldName;
              const isRelation = isFieldRelation(fieldDefinition);
              const fieldNameOrRelationIdName =
                isRelation &&
                fieldMetadataItem.type === FieldMetadataType.RELATION
                  ? computeRelationGqlFieldJoinColumnName({
                      name: fieldMetadataItem.name,
                    })
                  : fieldName;

              const value = formValues[fieldNameOrRelationIdName];

              const handleValueChange = (newValue: JsonValue) => {
                if (newValue === null) {
                  updateFormValue(fieldNameOrRelationIdName, null);
                } else if (isUpdateRecordValueEmpty(newValue)) {
                  updateFormValue(fieldNameOrRelationIdName, undefined);
                } else {
                  updateFormValue(fieldNameOrRelationIdName, newValue);
                }
              };

              return (
                <FormFieldInput
                  key={fieldDefinition.metadata.fieldName}
                  readonly={isSubmitting}
                  field={fieldDefinition}
                  defaultValue={value as JsonValue}
                  onChange={handleValueChange}
                  onClear={() =>
                    updateFormValue(fieldNameOrRelationIdName, undefined)
                  }
                />
              );
            },
          )}
        </Section>
      </StyledSectionContainer>

      <StyledFooterContainer>
        <Button
          title={isSubmitting ? t`Creating` : t`Create`}
          variant="primary"
          accent="blue"
          size="small"
          Icon={IconPlus}
          isLoading={isSubmitting}
          hotkeys={isSubmitting ? undefined : [getOsControlSymbol(), '⏎']}
          disabled={isSubmitting}
          onClick={handleSave}
        />
      </StyledFooterContainer>
    </StyledPage>
  );
};
