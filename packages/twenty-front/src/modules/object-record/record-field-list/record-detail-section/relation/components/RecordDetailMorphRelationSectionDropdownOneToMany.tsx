import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useOpenMorphRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useOpenMorphRelationOneToManyFieldInput';
import { useUpdateMorphRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateMorphRelationOneToManyFieldInput';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { FieldMetadataType } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

export const RecordDetailMorphRelationSectionDropdownOneToMany = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.MORPH_RELATION,
    isFieldMorphRelation,
    fieldDefinition,
  );

  const { fieldName, morphRelations } = fieldDefinition.metadata;

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

  // todo @guilllim update this

  // const handleOpenRelationPickerDropdown = () => {
  //   setMultipleRecordPickerSearchableObjectMetadataItems([
  //     relationObjectMetadataItem,
  //   ]);
  //   setMultipleRecordPickerSearchFilter('');
  //   setMultipleRecordPickerPickableMorphItems(
  //     relationRecords.map((record) => ({
  //       recordId: record.id,
  //       objectMetadataId: relationObjectMetadataItem.id,
  //       isSelected: true,
  //       isMatchingSearchFilter: true,
  //     })),
  //   );

  //   openMultipleRecordPicker(dropdownId);

  //   multipleRecordPickerPerformSearch({
  //     multipleRecordPickerInstanceId: dropdownId,
  //     forceSearchFilter: '',
  //     forceSearchableObjectMetadataItems: [relationObjectMetadataItem],
  //     forcePickableMorphItems: relationRecords.map((record) => ({
  //       recordId: record.id,
  //       objectMetadataId: relationObjectMetadataItem.id,
  //       isSelected: true,
  //       isMatchingSearchFilter: true,
  //     })),
  //   });
  // };

  const { updateMorphRelationOneToMany } =
    useUpdateMorphRelationOneToManyFieldInput();

  const { openMorphRelationOneToManyFieldInput } =
    useOpenMorphRelationOneToManyFieldInput();

  const handleOpenRelationPickerDropdown = () => {
    openMorphRelationOneToManyFieldInput({
      recordId,
      prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX, // todo @guilllim change that
      fieldDefinition,
    });
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
          onChange={(morphItem) => {
            updateMorphRelationOneToMany(morphItem);
          }}
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
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
      }
    />
  );
};
