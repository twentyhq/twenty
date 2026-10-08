import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordFormFieldInputs } from '@/object-record/record-form/components/RecordFormFieldInputs';
import { useRecordCreationFormSettle } from '@/object-record/record-form/hooks/useRecordCreationFormSettle';
import { useRecordFormFields } from '@/object-record/record-form/hooks/useRecordFormFields';
import { computeRecordFormCreateRecordInput } from '@/object-record/record-form/utils/computeRecordFormCreateRecordInput';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordCreationFormSettingsInSidePanel } from '@/side-panel/hooks/useOpenRecordCreationFormSettingsInSidePanel';
import { recordCreationFormAreHiddenFieldsShownComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormAreHiddenFieldsShownComponentState';
import { recordCreationFormDraftComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormDraftComponentState';
import { recordCreationFormRequestComponentState } from '@/side-panel/pages/record-creation-form/states/recordCreationFormRequestComponentState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { type DraftValidationRuleViolation } from '@/validation-rules/types/DraftValidationRuleViolation';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { computeDraftValidationRuleViolations } from '@/validation-rules/utils/computeDraftValidationRuleViolations';
import { getValidationRuleViolationFieldMetadataIdsFromError } from '@/validation-rules/utils/getValidationRuleViolationFieldMetadataIdsFromError';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useState } from 'react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { type JsonValue } from 'type-fest';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledValidationRuleError = styled.div`
  background: ${themeCssVariables.background.danger};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledValidationRuleErrors = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  max-height: 30%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
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

const StyledHiddenFieldsToggle = styled.div`
  display: flex;
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
  const theme = useTheme();

  const { settleRecordCreationDraft } = useRecordCreationFormSettle();

  const [recordCreationFormDraft, setRecordCreationFormDraft] =
    useAtomComponentState(recordCreationFormDraftComponentState);

  const [
    recordCreationFormAreHiddenFieldsShown,
    setRecordCreationFormAreHiddenFieldsShown,
  ] = useAtomComponentState(
    recordCreationFormAreHiddenFieldsShownComponentState,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationRuleViolations, setValidationRuleViolations] = useState<
    DraftValidationRuleViolation[]
  >([]);

  const { validationRules } = useValidationRules({ objectMetadataId });
  const currentFocusId = useAtomStateValue(currentFocusIdSelector);

  const draftRecord = recordCreationFormDraft ?? initialDraftRecord;

  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);

  const { openRecordCreationFormSettingsInSidePanel } =
    useOpenRecordCreationFormSettingsInSidePanel();

  const { recordFormFields } = useRecordFormFields({ objectMetadataItem });
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const editableRecordFormFields = recordFormFields.filter(
    ({ fieldMetadataItem }) =>
      getFieldPermissions({
        objectPermissions,
        fieldMetadataId: fieldMetadataItem.id,
      }).canUpdateField,
  );

  const visibleFieldMetadataItems = editableRecordFormFields
    .filter((recordFormField) => recordFormField.isVisible)
    .map((recordFormField) => recordFormField.fieldMetadataItem);

  const hiddenFieldMetadataItems = editableRecordFormFields
    .filter((recordFormField) => !recordFormField.isVisible)
    .map((recordFormField) => recordFormField.fieldMetadataItem);

  const hiddenFieldsCount = hiddenFieldMetadataItems.length;

  const computeViolations = (draftRecordToCheck: Partial<ObjectRecord>) =>
    computeDraftValidationRuleViolations({
      validationRules,
      draftRecord: draftRecordToCheck,
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataItem,
        objectMetadataItems,
      }),
      fieldMetadataItems: objectMetadataItem.fields,
      now: new Date().toISOString(),
    });

  const updateDraftRecord = (gqlFieldName: string, value: JsonValue) => {
    setRecordCreationFormDraft((previousDraftRecord) => ({
      ...(previousDraftRecord ?? initialDraftRecord),
      [gqlFieldName]: value,
    }));

    if (validationRuleViolations.length > 0) {
      setValidationRuleViolations(
        computeViolations({ ...draftRecord, [gqlFieldName]: value }),
      );
    }
  };

  const handleFieldValueChange = (gqlFieldName: string, value: JsonValue) => {
    updateDraftRecord(gqlFieldName, value);
  };

  const handleFieldValueClear = (gqlFieldName: string) => {
    updateDraftRecord(gqlFieldName, null);
  };

  const revealHiddenFieldsIfTargeted = (
    targetedFieldMetadataIds: (string | null)[],
  ) => {
    const isAnyHiddenFieldTargeted = hiddenFieldMetadataItems.some(
      (fieldMetadataItem) =>
        targetedFieldMetadataIds.includes(fieldMetadataItem.id),
    );

    if (isAnyHiddenFieldTargeted) {
      setRecordCreationFormAreHiddenFieldsShown(true);
    }
  };

  const handleCreateClick = async () => {
    if (isSubmitting) {
      return;
    }

    if (validationRules.length > 0) {
      const draftViolations = computeViolations(draftRecord);

      setValidationRuleViolations(draftViolations);

      revealHiddenFieldsIfTargeted(
        draftViolations.map((violation) => violation.fieldMetadataId),
      );

      if (draftViolations.length > 0) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { error } = await settleRecordCreationDraft({
        requestId,
        draftRecord: computeRecordFormCreateRecordInput({
          draftRecord,
          fieldMetadataItems: objectMetadataItem.fields,
          objectMetadataItems,
        }),
      });

      revealHiddenFieldsIfTargeted(
        getValidationRuleViolationFieldMetadataIdsFromError(error),
      );
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
        <RecordFormFieldInputs
          objectMetadataItem={objectMetadataItem}
          fieldMetadataItems={visibleFieldMetadataItems}
          draftRecord={draftRecord}
          onFieldValueChange={handleFieldValueChange}
          onFieldValueClear={handleFieldValueClear}
        />
        {hiddenFieldsCount > 0 && (
          <StyledHiddenFieldsToggle>
            <LightButton
              startIcon={
                recordCreationFormAreHiddenFieldsShown ? (
                  <IconChevronUp />
                ) : (
                  <IconChevronDown />
                )
              }
              onClick={() =>
                setRecordCreationFormAreHiddenFieldsShown(
                  !recordCreationFormAreHiddenFieldsShown,
                )
              }
            >
              {recordCreationFormAreHiddenFieldsShown
                ? t`Collapse hidden fields`
                : t`Show hidden fields (${hiddenFieldsCount})`}
            </LightButton>
          </StyledHiddenFieldsToggle>
        )}
        {recordCreationFormAreHiddenFieldsShown && hiddenFieldsCount > 0 && (
          <RecordFormFieldInputs
            objectMetadataItem={objectMetadataItem}
            fieldMetadataItems={hiddenFieldMetadataItems}
            draftRecord={draftRecord}
            onFieldValueChange={handleFieldValueChange}
            onFieldValueClear={handleFieldValueClear}
          />
        )}
      </StyledContent>
      {validationRuleViolations.length > 0 && (
        <StyledValidationRuleErrors>
          {validationRuleViolations.map((violation) => (
            <StyledValidationRuleError key={violation.ruleId} role="alert">
              {violation.message}
            </StyledValidationRuleError>
          ))}
        </StyledValidationRuleErrors>
      )}
      <SidePanelFooter
        actions={[
          ...(hasLayoutsPermission
            ? [
                <Button
                  key="edit-form"
                  size="sm"
                  onClick={() =>
                    openRecordCreationFormSettingsInSidePanel(
                      objectMetadataItem,
                    )
                  }
                >{t`Edit`}</Button>,
              ]
            : []),
          <Button
            key="create-record"
            startIcon={<IconPlus />}
            size="sm"
            onClick={handleCreateClick}
            loading={isSubmitting}
            shortcut={['Mod', 'Enter']}
            data-testid="record-creation-form-create-button"
            variant="solid"
            color="accent"
          >{t`Create`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
