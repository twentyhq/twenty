import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
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

  const { closeDropdown, dropdownPlacement } = useDropdown(dropdownId);

  const setSingleRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const setSingleRecordPickerSelectedId = useSetRecoilComponentStateV2(
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
    closeDropdown();

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

  const handleOpenRelationPickerDropdown = () => {
    setSingleRecordPickerSearchFilter('');
    if (relationRecords.length > 0) {
      setSingleRecordPickerSelectedId(relationRecords[0]?.id);
    }
  };

  const handleCreateNew = (searchString?: string) => {
    closeDropdown();

    createNewRecordAndOpenRightDrawer?.(searchString);
  };

  const shouldAllowCreateNew =
    relationObjectMetadataNameSingular !==
    CoreObjectNameSingular.WorkspaceMember;

  return (
    <DropdownScope dropdownScopeId={dropdownId}>
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
            onCancel={closeDropdown}
            onCreate={shouldAllowCreateNew ? handleCreateNew : undefined}
            layoutDirection={
              dropdownPlacement?.includes('end')
                ? 'search-bar-on-bottom'
                : 'search-bar-on-top'
            }
          />
        }
      />
    </DropdownScope>
  );
};
