import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { editColumnRequestComponentState } from '@/side-panel/pages/edit-column/states/editColumnRequestComponentState';
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
import { computeViewFieldSettingsWithLabel } from '@/views/utils/computeViewFieldSettingsWithLabel';
import { mapRecordFieldToViewField } from '@/views/utils/mapRecordFieldToViewField';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
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

  const [columnName, setColumnName] = useState(
    recordField.settings?.label ?? '',
  );

  const handleSaveClick = async () => {
    const updatedRecordField = {
      ...recordField,
      settings: computeViewFieldSettingsWithLabel({
        settings: recordField.settings,
        label: columnName,
      }),
    };

    upsertRecordField(updatedRecordField);

    const isSaved = await saveViewFields([
      mapRecordFieldToViewField(updatedRecordField),
    ]);

    if (!isSaved) {
      upsertRecordField(recordField);
      return;
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
            shortcut={['Mod', 'Enter']}
            variant="solid"
            color="accent"
          >{t`Save`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
