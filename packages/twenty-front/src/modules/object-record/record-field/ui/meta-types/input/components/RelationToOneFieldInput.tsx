import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useRelationField } from '../../hooks/useRelationField';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconForbid } from 'twenty-ui/display';

export const RelationToOneFieldInput = () => {
  const { t } = useLingui();
  const { fieldDefinition, recordId } = useRelationField<ObjectRecord>();

  const { onSubmit, onCancel } = useContext(FieldInputEventContext);

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleRecordSelected = (
    selectedRecord: SingleRecordPickerRecord | null | undefined,
  ) => onSubmit?.({ newValue: selectedRecord?.record ?? null });

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === fieldDefinition.metadata.relationFieldMetadataId,
  );

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      relationObjectMetadataNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  const layoutDirection = useRecoilComponentValue(
    recordFieldInputLayoutDirectionComponentState,
  );

  const isLoading = useRecoilComponentValue(
    recordFieldInputLayoutDirectionLoadingComponentState,
  );

  const setSingleRecordPickerSelectedId = useSetRecoilComponentState(
    singleRecordPickerSelectedIdComponentState,
    instanceId,
  );

  const handleCreateNew = async (searchInput?: string) => {
    const newRecordId = await createNewRecordAndOpenRightDrawer?.(searchInput);

    if (isDefined(newRecordId)) {
      setSingleRecordPickerSelectedId(newRecordId);
    }
  };

  if (isLoading) {
    return <></>;
  }
  const fieldLabel = fieldDefinition.label;

  return (
    <SingleRecordPicker
      focusId={instanceId}
      componentInstanceId={instanceId}
      EmptyIcon={IconForbid}
      emptyLabel={t`No ${fieldLabel}`}
      onCancel={onCancel}
      onCreate={handleCreateNew}
      onRecordSelected={handleRecordSelected}
      objectNameSingular={
        fieldDefinition.metadata.relationObjectMetadataNameSingular
      }
      recordPickerInstanceId={instanceId}
      layoutDirection={
        layoutDirection === 'downward'
          ? 'search-bar-on-top'
          : 'search-bar-on-bottom'
      }
    />
  );
};
