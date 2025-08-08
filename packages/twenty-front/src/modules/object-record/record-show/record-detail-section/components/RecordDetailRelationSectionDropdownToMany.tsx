import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { useUpdateRelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationFromManyFieldInput';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

export const RecordDetailRelationSectionDropdownToMany = () => {
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

  const relationRecords: ObjectRecord[] = (fieldValue as ObjectRecord[]) ?? [];

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
  });

  const { closeDropdown } = useCloseDropdown();

  const dropdownPlacement = useRecoilComponentValue(
    dropdownPlacementComponentState,
    dropdownId,
  );

  const setMultipleRecordPickerSearchFilter = useSetRecoilComponentState(
    multipleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const setMultipleRecordPickerPickableMorphItems = useSetRecoilComponentState(
    multipleRecordPickerPickableMorphItemsComponentState,
    dropdownId,
  );

  const setMultipleRecordPickerSearchableObjectMetadataItems =
    useSetRecoilComponentState(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState,
      dropdownId,
    );

  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setMultipleRecordPickerSearchFilter('');
  }, [setMultipleRecordPickerSearchFilter]);

  const { updateRelation } = useUpdateRelationFromManyFieldInput();

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  const handleOpenRelationPickerDropdown = () => {
    setMultipleRecordPickerSearchableObjectMetadataItems([
      relationObjectMetadataItem,
    ]);
    setMultipleRecordPickerSearchFilter('');
    setMultipleRecordPickerPickableMorphItems(
      relationRecords.map((record) => ({
        recordId: record.id,
        objectMetadataId: relationObjectMetadataItem.id,
        isSelected: true,
        isMatchingSearchFilter: true,
      })),
    );

    openMultipleRecordPicker(dropdownId);

    multipleRecordPickerPerformSearch({
      multipleRecordPickerInstanceId: dropdownId,
      forceSearchFilter: '',
      forceSearchableObjectMetadataItems: [relationObjectMetadataItem],
      forcePickableMorphItems: relationRecords.map((record) => ({
        recordId: record.id,
        objectMetadataId: relationObjectMetadataItem.id,
        isSelected: true,
        isMatchingSearchFilter: true,
      })),
    });
  };

  const handleCreateNew = (searchString?: string) => {
    closeDropdown(dropdownId);

    createNewRecordAndOpenRightDrawer?.(searchString);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="left-start"
      onClose={handleCloseRelationPickerDropdown}
      onOpen={handleOpenRelationPickerDropdown}
      clickableComponent={
        <LightIconButton
          className="displayOnHover"
          Icon={IconPlus}
          accent="tertiary"
        />
      }
      dropdownComponents={
        <MultipleRecordPicker
          focusId={dropdownId}
          componentInstanceId={dropdownId}
          onCreate={handleCreateNew}
          onChange={updateRelation}
          onSubmit={() => {
            closeDropdown(dropdownId);
          }}
          onClickOutside={() => {
            closeDropdown(dropdownId);
          }}
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
