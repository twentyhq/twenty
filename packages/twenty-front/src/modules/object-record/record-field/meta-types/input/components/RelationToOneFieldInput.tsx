import { usePersistField } from '../../../hooks/usePersistField';
import { useRelationField } from '../../hooks/useRelationField';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isDefined } from 'twenty-shared/utils';
import { IconForbid } from 'twenty-ui/display';

export type RelationToOneFieldInputProps = {
  onSubmit?: FieldInputEvent;
  onCancel?: () => void;
};

export const RelationToOneFieldInput = ({
  onSubmit,
  onCancel,
}: RelationToOneFieldInputProps) => {
  const { fieldDefinition, recordId } = useRelationField<ObjectRecord>();

  const persistField = usePersistField();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleRecordSelected = (
    selectedRecord: SingleRecordPickerRecord | null | undefined,
  ) => onSubmit?.(() => persistField(selectedRecord?.record ?? null));

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

  return (
    <SingleRecordPicker
      focusId={instanceId}
      componentInstanceId={instanceId}
      EmptyIcon={IconForbid}
      emptyLabel={'No ' + fieldDefinition.label}
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
