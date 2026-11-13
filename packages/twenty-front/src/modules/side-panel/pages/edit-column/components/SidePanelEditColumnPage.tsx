import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { useUpdateRecordTableColumnSettings } from '@/object-record/record-table/hooks/useUpdateRecordTableColumnSettings';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import {
  type EditColumnRequest,
  editColumnRequestComponentState,
} from '@/side-panel/pages/edit-column/states/editColumnRequestComponentState';
import { TextInput } from '@/ui/input/components/TextInput';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { computeViewFieldSettingsWithLabel } from '@/views/utils/computeViewFieldSettingsWithLabel';
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

  return <SidePanelEditColumnPageContent request={editColumnRequest} />;
};

const SidePanelEditColumnPageContent = ({
  request,
}: {
  request: EditColumnRequest;
}) => {
  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
    request.recordTableId,
  );

  const recordField = currentRecordFields.find(
    (currentRecordField) => currentRecordField.id === request.recordFieldId,
  );

  if (!isDefined(recordField) || isCanonicalRecordField(recordField)) {
    return null;
  }

  return (
    <SidePanelEditColumnForm request={request} recordField={recordField} />
  );
};

const SidePanelEditColumnForm = ({
  request: { recordTableId },
  recordField,
}: {
  request: EditColumnRequest;
  recordField: RecordField;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const currentFocusId = useAtomStateValue(currentFocusIdSelector);
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { updateRecordTableColumnSettings } =
    useUpdateRecordTableColumnSettings();

  const { foundFieldMetadataItem: fieldMetadataItem } =
    useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
      fieldMetadataItemId: recordField.fieldMetadataItemId,
    });

  const [columnName, setColumnName] = useState(
    recordField.settings?.label ?? '',
  );

  const handleSaveClick = async () => {
    await updateRecordTableColumnSettings({
      recordTableId,
      recordFieldId: recordField.id,
      settings: computeViewFieldSettingsWithLabel({
        settings: recordField.settings,
        label: columnName,
      }),
    });

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
