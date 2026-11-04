import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { useRecordUpdateFormContextOrThrow } from '@/object-record/record-form/contexts/RecordUpdateFormContext';
import { computeRecordFormCreateRecordInput } from '@/object-record/record-form/utils/computeRecordFormCreateRecordInput';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import {
  type RecordUpdateFormRequest,
  recordUpdateFormRequestComponentState,
} from '@/side-panel/pages/record-update-form/states/recordUpdateFormRequestComponentState';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { computeDraftValidationRuleViolations } from '@/validation-rules/utils/computeDraftValidationRuleViolations';
import { groupValidationRuleViolationsByField } from '@/validation-rules/utils/groupValidationRuleViolationsByField';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { Key } from 'ts-key-enum';
import { type JsonValue } from 'type-fest';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  outline: none;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

export const SidePanelRecordUpdateFormPage = () => {
  const recordUpdateFormRequest = useAtomComponentStateValue(
    recordUpdateFormRequestComponentState,
  );

  if (!isDefined(recordUpdateFormRequest)) {
    return null;
  }

  return <SidePanelRecordUpdateForm request={recordUpdateFormRequest} />;
};

const SidePanelRecordUpdateForm = ({
  request: {
    requestId,
    objectMetadataId,
    draftRecord,
    fieldMetadataIds,
    violations,
  },
}: {
  request: RecordUpdateFormRequest;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const formInstanceId = useId();

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { validationRules } = useValidationRules({ objectMetadataId });
  const { settleRecordUpdateForm } = useRecordUpdateFormContextOrThrow();
  const currentFocusId = useAtomStateValue(currentFocusIdSelector);

  const [completedDraftRecord, setCompletedDraftRecord] =
    useState<Partial<ObjectRecord>>(draftRecord);
  const [validationRuleViolations, setValidationRuleViolations] =
    useState<ValidationRuleViolation[]>(violations);

  const fieldMetadataItemsToComplete = objectMetadataItem.fields.filter(
    (fieldMetadataItem) => fieldMetadataIds.includes(fieldMetadataItem.id),
  );

  const { violationsByFieldMetadataId } = groupValidationRuleViolationsByField({
    violations: validationRuleViolations,
    displayedFieldMetadataIds: fieldMetadataIds,
  });

  const computeFieldViolations = (draftRecordToCheck: Partial<ObjectRecord>) =>
    computeDraftValidationRuleViolations({
      validationRules,
      draftRecord: draftRecordToCheck,
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataItem,
        objectMetadataItems,
      }),
      fieldMetadataItems: objectMetadataItem.fields,
      now: new Date().toISOString(),
    }).filter(
      (violation) =>
        isDefined(violation.fieldMetadataId) &&
        fieldMetadataIds.includes(violation.fieldMetadataId),
    );

  const updateCompletedDraftRecord = (
    gqlFieldName: string,
    value: JsonValue,
  ) => {
    const nextDraftRecord = { ...completedDraftRecord, [gqlFieldName]: value };

    setCompletedDraftRecord(nextDraftRecord);
    setValidationRuleViolations(computeFieldViolations(nextDraftRecord));
  };

  const handleSaveClick = () => {
    const remainingViolations = computeFieldViolations(completedDraftRecord);

    if (remainingViolations.length > 0) {
      setValidationRuleViolations(remainingViolations);
      return;
    }

    const completedFields = Object.fromEntries(
      fieldMetadataItemsToComplete.map((fieldMetadataItem) => {
        const gqlFieldName =
          getFieldMetadataItemGqlFieldName(fieldMetadataItem);

        return [gqlFieldName, completedDraftRecord[gqlFieldName] ?? null];
      }),
    );

    settleRecordUpdateForm({
      requestId,
      completedFields: computeRecordFormCreateRecordInput({
        draftRecord: completedFields,
        fieldMetadataItems: fieldMetadataItemsToComplete,
        objectMetadataItems,
      }),
    });
  };

  const containerRef = useHotkeysOnFocusedElement({
    keys: [`${Key.Meta}+${Key.Enter}`, `${Key.Control}+${Key.Enter}`],
    focusId: currentFocusId ?? SIDE_PANEL_FOCUS_ID,
    callback: handleSaveClick,
    dependencies: [currentFocusId, handleSaveClick],
  });

  return (
    <StyledContainer ref={containerRef} tabIndex={-1}>
      <PageCardHeader
        title={
          <HeaderIdentifier
            icon={
              <ObjectMetadataIcon
                objectMetadataItem={objectMetadataItem}
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            }
            title={t`Update ${objectMetadataItem.labelSingular}`}
          />
        }
      />
      <StyledContent>
        <RecordFormFieldInputs
          objectMetadataItem={objectMetadataItem}
          fieldMetadataItems={fieldMetadataItemsToComplete}
          draftRecord={completedDraftRecord}
          validationRuleViolationsByFieldMetadataId={
            violationsByFieldMetadataId
          }
          onFieldValueChange={updateCompletedDraftRecord}
          onFieldValueClear={(gqlFieldName) =>
            updateCompletedDraftRecord(gqlFieldName, null)
          }
          formInstanceId={formInstanceId}
        />
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="save-record"
            startIcon={<IconCheck />}
            size="sm"
            onClick={handleSaveClick}
            shortcut={['Mod', 'Enter']}
            variant="solid"
            color="accent"
          >{t`Save`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
