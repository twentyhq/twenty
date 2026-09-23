import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { useRecordCreationFormSettle } from '@/object-record/record-form/hooks/useRecordCreationFormSettle';
import { useRecordFormFieldMetadataItems } from '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems';
import { computeRecordFormCreateRecordInput } from '@/object-record/record-form/utils/computeRecordFormCreateRecordInput';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordCreationFormDraftComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormDraftComponentState';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { type DraftValidationRuleViolation } from '@/validation-rules/types/DraftValidationRuleViolation';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { computeDraftValidationRuleViolations } from '@/validation-rules/utils/computeDraftValidationRuleViolations';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext, useState } from 'react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { type JsonValue } from 'type-fest';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { getOsControlSymbol } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledRecordLevelError = styled.div`
  background: ${themeCssVariables.background.danger};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

export const SidePanelRecordCreationFormPage = () => {
  const recordCreationFormRequest = useAtomComponentStateValue(
    recordCreationFormRequestComponentState,
  );

  if (!isDefined(recordCreationFormRequest)) {
    return null;
  }

  return (
    <SidePanelRecordCreationForm
      requestId={recordCreationFormRequest.requestId}
      objectMetadataId={recordCreationFormRequest.objectMetadataId}
      initialDraftRecord={recordCreationFormRequest.initialDraftRecord}
    />
  );
};

const SidePanelRecordCreationForm = ({
  requestId,
  objectMetadataId,
  initialDraftRecord,
}: {
  requestId: string;
  objectMetadataId: string;
  initialDraftRecord: Partial<ObjectRecord>;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { theme } = useContext(ThemeContext);

  const { settleRecordCreationDraft } = useRecordCreationFormSettle();

  const [recordCreationFormDraft, setRecordCreationFormDraft] =
    useAtomComponentState(recordCreationFormDraftComponentState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationRuleViolations, setValidationRuleViolations] = useState<
    DraftValidationRuleViolation[]
  >([]);

  const { validationRules } = useValidationRules({ objectMetadataId });
  const currentFocusId = useAtomStateValue(currentFocusIdSelector);

  const draftRecord = recordCreationFormDraft ?? initialDraftRecord;

  const { recordFormFieldMetadataItems } = useRecordFormFieldMetadataItems({
    objectMetadataItem,
  });

  const computeViolations = (draftRecordToCheck: Partial<ObjectRecord>) =>
    computeDraftValidationRuleViolations({
      validationRules,
      draftRecord: draftRecordToCheck,
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataItem,
        objectMetadataItems,
      }),
      now: new Date().toISOString(),
    });

  const updateDraftRecord = (gqlFieldName: string, value: JsonValue) => {
    const nextDraftRecord = { ...draftRecord, [gqlFieldName]: value };

    setRecordCreationFormDraft(nextDraftRecord);

    if (validationRuleViolations.length > 0) {
      setValidationRuleViolations(computeViolations(nextDraftRecord));
    }
  };

  const handleFieldValueChange = (gqlFieldName: string, value: JsonValue) => {
    updateDraftRecord(gqlFieldName, value);
  };

  const handleFieldValueClear = (gqlFieldName: string) => {
    updateDraftRecord(gqlFieldName, null);
  };

  const errorMessageByFieldMetadataId = Object.fromEntries(
    validationRuleViolations
      .filter((violation) => isDefined(violation.fieldMetadataId))
      .map((violation) => [violation.fieldMetadataId, violation.message]),
  );

  const recordLevelViolations = validationRuleViolations.filter(
    (violation) =>
      !isDefined(violation.fieldMetadataId) ||
      !recordFormFieldMetadataItems.some(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === violation.fieldMetadataId,
      ),
  );

  const handleCreateClick = async () => {
    if (isSubmitting) {
      return;
    }

    const draftViolations = computeViolations(draftRecord);

    setValidationRuleViolations(draftViolations);

    if (draftViolations.length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await settleRecordCreationDraft({
        requestId,
        draftRecord: computeRecordFormCreateRecordInput({
          draftRecord,
          fieldMetadataItems: recordFormFieldMetadataItems,
          objectMetadataItems,
        }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerRef = useHotkeysOnFocusedElement({
    keys: [`${Key.Meta}+${Key.Enter}`, `${Key.Control}+${Key.Enter}`],
    focusId: currentFocusId ?? SIDE_PANEL_FOCUS_ID,
    callback: handleCreateClick,
    dependencies: [currentFocusId, handleCreateClick],
  });

  return (
    <StyledContainer ref={containerRef}>
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
            title={t`Create ${objectMetadataItem.labelSingular}`}
          />
        }
      />
      <StyledContent>
        {recordLevelViolations.map((violation) => (
          <StyledRecordLevelError key={violation.ruleId}>
            {violation.message}
          </StyledRecordLevelError>
        ))}
        <RecordFormFieldInputs
          objectMetadataItem={objectMetadataItem}
          fieldMetadataItems={recordFormFieldMetadataItems}
          draftRecord={draftRecord}
          onFieldValueChange={handleFieldValueChange}
          onFieldValueClear={handleFieldValueClear}
          errorMessageByFieldMetadataId={errorMessageByFieldMetadataId}
        />
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="create-record"
            startIcon={<IconPlus />}
            size="sm"
            onClick={handleCreateClick}
            loading={isSubmitting}
            hotkeys={[getOsControlSymbol(), '⏎']}
            data-testid="record-creation-form-create-button"
            variant="solid"
            color="accent"
          >{t`Create`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
