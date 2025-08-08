import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { useSingleRecordPickerOpen } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerOpen';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { IconForbid, IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

export const RecordDetailRelationSectionDropdownToOne = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | ObjectRecord[] | null
  >(recordStoreFamilySelector({ recordId, fieldName }));

  const relationRecords: ObjectRecord[] = fieldValue
    ? [fieldValue as ObjectRecord]
    : [];

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
  });

  const { closeDropdown } = useCloseDropdown();

  const dropdownPlacement = useRecoilComponentValue(
    dropdownPlacementComponentState,
    dropdownId,
  );

  const setSingleRecordPickerSearchFilter = useSetRecoilComponentState(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const setSingleRecordPickerSelectedId = useSetRecoilComponentState(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setSingleRecordPickerSearchFilter('');
  }, [setSingleRecordPickerSearchFilter]);

  const persistField = usePersistField();

  const handleRelationPickerEntitySelected = (
    selectedRelationEntity?: SingleRecordPickerRecord,
  ) => {
    closeDropdown(dropdownId);

    if (!selectedRelationEntity?.id || !relationFieldMetadataItem?.name) return;

    persistField(selectedRelationEntity.record);
  };

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  const { openSingleRecordPicker } = useSingleRecordPickerOpen();

  const handleOpenRelationPickerDropdown = () => {
    setSingleRecordPickerSearchFilter('');
    openSingleRecordPicker(dropdownId);

    if (relationRecords.length > 0) {
      setSingleRecordPickerSelectedId(relationRecords[0]?.id);
    }
  };

  const handleCreateNew = (searchString?: string) => {
    closeDropdown(dropdownId);

    createNewRecordAndOpenRightDrawer?.(searchString);
  };

  const shouldAllowCreateNew =
    relationObjectMetadataNameSingular !==
    CoreObjectNameSingular.WorkspaceMember;

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="left-start"
      onClose={handleCloseRelationPickerDropdown}
      onOpen={handleOpenRelationPickerDropdown}
      clickableComponent={
        <LightIconButton
          className="displayOnHover"
          Icon={IconPencil}
          accent="tertiary"
        />
      }
      dropdownComponents={
        <SingleRecordPicker
          focusId={dropdownId}
          componentInstanceId={dropdownId}
          EmptyIcon={IconForbid}
          onRecordSelected={handleRelationPickerEntitySelected}
          objectNameSingular={relationObjectMetadataNameSingular}
          recordPickerInstanceId={dropdownId}
          onCancel={() => closeDropdown(dropdownId)}
          onCreate={shouldAllowCreateNew ? handleCreateNew : undefined}
          layoutDirection={
            dropdownPlacement?.includes('end')
              ? 'search-bar-on-bottom'
              : 'search-bar-on-top'
          }
        />
      }
    />
  );
};
