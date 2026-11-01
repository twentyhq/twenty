import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecordFormFields } from '@/object-record/record-form/hooks/useRecordFormFields';
import { type RecordFormField } from '@/object-record/record-form/types/RecordFormField';
import { isFieldMetadataItemEligibleForRecordForm } from '@/object-record/record-form/utils/isFieldMetadataItemEligibleForRecordForm';
import { useUpdatePageLayoutWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWidgets';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { recordCreationFormSettingsObjectMetadataIdComponentState } from '@/side-panel/pages/record-creation-form-settings/states/recordCreationFormSettingsObjectMetadataIdComponentState';
import { computePageLayoutWidgetIsActiveUpdates } from '@/side-panel/pages/record-creation-form-settings/utils/computePageLayoutWidgetIsActiveUpdates';
import { computePageLayoutWidgetPositionUpdates } from '@/side-panel/pages/record-creation-form-settings/utils/computePageLayoutWidgetPositionUpdates';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconEye, IconEyeOff, useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

export const SidePanelRecordCreationFormSettingsPage = () => {
  const recordCreationFormSettingsObjectMetadataId = useAtomComponentStateValue(
    recordCreationFormSettingsObjectMetadataIdComponentState,
  );

  if (!isDefined(recordCreationFormSettingsObjectMetadataId)) {
    return null;
  }

  return (
    <SidePanelRecordCreationFormSettings
      objectMetadataId={recordCreationFormSettingsObjectMetadataId}
    />
  );
};

const SidePanelRecordCreationFormSettings = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { t, i18n } = useLingui();
  const { getIcon } = useIcons();
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });
  const { recordFormFields } = useRecordFormFields({ objectMetadataItem });
  const configurableRecordFormFields = recordFormFields.filter(
    ({ fieldMetadataItem }) =>
      isFieldMetadataItemEligibleForRecordForm(fieldMetadataItem),
  );
  const { goBackFromSidePanel, removePageFromSidePanelHistory } =
    useSidePanelHistory();
  const sidePanelPageId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );
  const { updatePageLayoutWidgets } = useUpdatePageLayoutWidgets();

  const [isVisibleByFieldMetadataId, setIsVisibleByFieldMetadataId] = useState<
    Record<string, boolean>
  >({});
  const [orderedFieldMetadataIds, setOrderedFieldMetadataIds] = useState<
    string[] | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);

  const configurableRecordFormFieldByFieldMetadataId = new Map(
    configurableRecordFormFields.map((recordFormField) => [
      recordFormField.fieldMetadataItem.id,
      recordFormField,
    ]),
  );

  const orderedConfigurableRecordFormFields = isDefined(orderedFieldMetadataIds)
    ? orderedFieldMetadataIds
        .map((fieldMetadataId) =>
          configurableRecordFormFieldByFieldMetadataId.get(fieldMetadataId),
        )
        .filter(isDefined)
    : configurableRecordFormFields;

  const isRecordFormFieldVisible = (recordFormField: RecordFormField) =>
    isVisibleByFieldMetadataId[recordFormField.fieldMetadataItem.id] ??
    recordFormField.isVisible;

  const handleToggleVisibility = (recordFormField: RecordFormField) => {
    if (isSaving) {
      return;
    }

    setIsVisibleByFieldMetadataId((previousIsVisibleByFieldMetadataId) => ({
      ...previousIsVisibleByFieldMetadataId,
      [recordFormField.fieldMetadataItem.id]:
        !isRecordFormFieldVisible(recordFormField),
    }));
  };

  const handleDragEnd = ({ source, destination }: DraggableListDropResult) => {
    if (
      isSaving ||
      !isDefined(destination) ||
      destination.index === source.index
    ) {
      return;
    }

    setOrderedFieldMetadataIds(
      moveArrayItem(
        orderedConfigurableRecordFormFields.map(
          ({ fieldMetadataItem }) => fieldMetadataItem.id,
        ),
        { fromIndex: source.index, toIndex: destination.index },
      ),
    );
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const pageLayoutWidgetUpdates = [
      ...computePageLayoutWidgetIsActiveUpdates({
        recordFormFields: configurableRecordFormFields,
        isVisibleByFieldMetadataId,
      }),
      ...(isDefined(orderedFieldMetadataIds)
        ? computePageLayoutWidgetPositionUpdates({
            recordFormFields,
            reorderedRecordFormFields: orderedConfigurableRecordFormFields,
          })
        : []),
    ];

    setIsSaving(true);

    const { status } = await updatePageLayoutWidgets(pageLayoutWidgetUpdates);

    setIsSaving(false);

    if (status === 'successful') {
      removePageFromSidePanelHistory(sidePanelPageId);
    }
  };

  return (
    <StyledContainer>
      <StyledContent>
        <SidePanelGroup heading={t`Fields`}>
          <DraggableList
            onDragEnd={handleDragEnd}
            draggableItems={orderedConfigurableRecordFormFields.map(
              (recordFormField, index) => {
                const { fieldMetadataItem } = recordFormField;
                const FieldIcon = getIcon(fieldMetadataItem.icon);
                const isVisible = isRecordFormFieldVisible(recordFormField);

                return (
                  <DraggableItem
                    key={fieldMetadataItem.id}
                    draggableId={fieldMetadataItem.id}
                    index={index}
                    isDragDisabled={isSaving}
                    itemComponent={
                      <DraggableListRow
                        startIcon={<FieldIcon />}
                        hasIconBackground
                        description={
                          isFieldTypeSupportedInSettings(fieldMetadataItem.type)
                            ? i18n._(
                                getSettingsFieldTypeConfig(
                                  fieldMetadataItem.type,
                                ).label,
                              )
                            : undefined
                        }
                        actionsVisibility="always"
                        dragHandleVisibility="hover"
                        isDragDisabled={isSaving}
                        onAction={() => handleToggleVisibility(recordFormField)}
                        isActionDisabled={isSaving}
                        actions={
                          <LightIconButton
                            disabled={isSaving}
                            aria-label={
                              isVisible
                                ? t`Hide ${fieldMetadataItem.label}`
                                : t`Show ${fieldMetadataItem.label}`
                            }
                            onClick={(event) => {
                              event.stopPropagation();
                              handleToggleVisibility(recordFormField);
                            }}
                          >
                            {isVisible ? <IconEye /> : <IconEyeOff />}
                          </LightIconButton>
                        }
                      >
                        {fieldMetadataItem.label}
                      </DraggableListRow>
                    }
                  />
                );
              },
            )}
          />
        </SidePanelGroup>
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="cancel"
            size="sm"
            onClick={goBackFromSidePanel}
          >{t`Cancel`}</Button>,
          <Button
            key="save"
            size="sm"
            variant="solid"
            color="accent"
            loading={isSaving}
            onClick={handleSave}
          >{t`Save`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
