import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { useSaveColumnScope } from '@/object-record/record-column-scope/hooks/useSaveColumnScope';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelEditColumnScopeSection } from '@/side-panel/pages/edit-column/components/SidePanelEditColumnScopeSection';
import { editColumnRequestComponentState } from '@/side-panel/pages/edit-column/states/editColumnRequestComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { scopeViewFromOwnerViewFieldIdFamilySelector } from '@/views/states/selectors/scopeViewFromOwnerViewFieldIdFamilySelector';
import { TextInput } from '@/ui/input/components/TextInput';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { computeViewFieldSettings } from '@/views/utils/computeViewFieldSettings';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { parseRecordLimitInput } from '@/views/utils/parseRecordLimitInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
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

export const SidePanelEditColumnPage = () => {
  const editColumnRequest = useAtomComponentStateValue(
    editColumnRequestComponentState,
  );

  if (!isDefined(editColumnRequest)) {
    return null;
  }

  return (
    <SidePanelEditColumnPageContent
      recordTableId={editColumnRequest.recordTableId}
      recordFieldId={editColumnRequest.recordFieldId}
    />
  );
};

const SidePanelEditColumnPageContent = ({
  recordTableId,
  recordFieldId,
}: {
  recordTableId: string;
  recordFieldId: string;
}) => {
  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const recordField = currentRecordFields.find(
    (currentRecordField) => currentRecordField.id === recordFieldId,
  );

  if (!isDefined(recordField) || isCanonicalRecordField(recordField)) {
    return null;
  }

  return (
    <SidePanelEditColumnForm
      recordTableId={recordTableId}
      recordField={recordField}
    />
  );
};

const SidePanelEditColumnForm = ({
  recordTableId,
  recordField,
}: {
  recordTableId: string;
  recordField: RecordField;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const currentFocusId = useAtomStateValue(currentFocusIdSelector);
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { upsertRecordField } = useUpsertRecordField(recordTableId);
  const { saveViewFields } = useSaveCurrentViewFields();

  const { foundFieldMetadataItem: fieldMetadataItem } =
    useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
      fieldMetadataItemId: recordField.fieldMetadataItemId,
    });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { saveColumnScope } = useSaveColumnScope();

  const sidePanelPageId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );
  const scopeInstanceId = `edit-column-scope-${sidePanelPageId}`;

  const scopeView = useAtomFamilySelectorValue(
    scopeViewFromOwnerViewFieldIdFamilySelector,
    { ownerViewFieldId: recordField.id },
  );

  const relationObjectMetadataItem =
    isDefined(fieldMetadataItem) &&
    isPlainOneToManyRelationField(fieldMetadataItem)
      ? findRelationTargetObjectMetadataItem({
          fieldMetadataItem,
          objectMetadataItems,
        })
      : undefined;

  const [columnName, setColumnName] = useState(
    recordField.settings?.label ?? '',
  );
  const [recordLimit, setRecordLimit] = useState(
    recordField.settings?.recordLimit?.toString() ?? '',
  );

  const isRecordLimitValid =
    !isDefined(relationObjectMetadataItem) ||
    parseRecordLimitInput(recordLimit).isValid;

  const handleSaveClick = async () => {
    if (!isRecordLimitValid) {
      return;
    }

    const updatedRecordField = {
      ...recordField,
      settings: computeViewFieldSettings({
        label: columnName,
        recordLimit: isDefined(relationObjectMetadataItem) ? recordLimit : '',
      }),
    };

    upsertRecordField(updatedRecordField);

    const areSettingsSaved = await saveViewFields([
      mapRecordFieldToViewField(updatedRecordField),
    ]);

    if (!areSettingsSaved) {
      upsertRecordField(recordField);
      return;
    }

    if (isDefined(relationObjectMetadataItem)) {
      const isScopeSaved = await saveColumnScope({
        scopeInstanceId,
        ownerViewFieldId: recordField.id,
        relationObjectMetadataId: relationObjectMetadataItem.id,
        scopeView,
      });

      if (!isScopeSaved) {
        return;
      }
    }

    goBackFromSidePanel();
  };

  const containerRef = useHotkeysOnFocusedElement({
    keys: [`${Key.Meta}+${Key.Enter}`, `${Key.Control}+${Key.Enter}`],
    focusId: currentFocusId ?? SIDE_PANEL_FOCUS_ID,
    callback: handleSaveClick,
    dependencies: [currentFocusId, handleSaveClick],
  });

  const FieldIcon = getIcon(fieldMetadataItem?.icon);

  return (
    <StyledContainer ref={containerRef} tabIndex={-1}>
      <PageCardHeader
        title={
          <HeaderIdentifier
            icon={
              <FieldIcon
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            }
            title={fieldMetadataItem?.label ?? ''}
          />
        }
      />
      <StyledContent>
        <TextInput
          label={t`Column name`}
          value={columnName}
          onChange={setColumnName}
          placeholder={fieldMetadataItem?.label}
          fullWidth
        />
        {isDefined(relationObjectMetadataItem) && (
          <SidePanelGroup heading={t`Related records`}>
            <SidePanelEditColumnScopeSection
              scopeInstanceId={scopeInstanceId}
              scopeView={scopeView}
              relationObjectMetadataItem={relationObjectMetadataItem}
              recordLimit={recordLimit}
              recordLimitError={
                isRecordLimitValid
                  ? undefined
                  : t`Enter a whole number from 1 to ${QUERY_MAX_RECORDS_FROM_RELATION}`
              }
              onRecordLimitChange={setRecordLimit}
            />
          </SidePanelGroup>
        )}
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="cancel"
            size="sm"
            onClick={goBackFromSidePanel}
          >{t`Cancel`}</Button>,
          <Button
            key="save-column"
            startIcon={<IconCheck />}
            size="sm"
            onClick={handleSaveClick}
            disabled={!isRecordLimitValid}
            shortcut={['Mod', 'Enter']}
            variant="solid"
            color="accent"
          >{t`Save`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
