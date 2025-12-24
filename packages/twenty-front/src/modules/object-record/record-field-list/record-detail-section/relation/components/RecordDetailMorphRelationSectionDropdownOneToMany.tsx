import { type ReactNode, useCallback, useContext } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
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
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { FieldMetadataType } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

type RecordDetailMorphRelationSectionDropdownOneToManyProps = {
  dropdownTriggerClickableComponent?: ReactNode;
};

export const RecordDetailMorphRelationSectionDropdownOneToMany = ({
  dropdownTriggerClickableComponent,
}: RecordDetailMorphRelationSectionDropdownOneToManyProps) => {
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.MORPH_RELATION,
    isFieldMorphRelation,
    fieldDefinition,
  );

  const { morphRelations } = fieldDefinition.metadata;
  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataItems = morphRelations
    .map((morphRelation) => morphRelation.targetObjectMetadata)
    .map((relationObjectMetadataItem) =>
      objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === relationObjectMetadataItem.id,
      ),
    )
    .filter(isDefined);

  const recordsWithObjectNameSingular =
    useGetMorphRelationRelatedRecordsWithObjectNameSingular({
      recordId,
      morphRelations: morphRelations,
    });

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
    instanceId: scopeInstanceId,
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

  const handleOpenRelationPickerDropdown = () => {
    setMultipleRecordPickerSearchableObjectMetadataItems(
      relationObjectMetadataItems,
    );
    setMultipleRecordPickerSearchFilter('');
    setMultipleRecordPickerPickableMorphItems(
      recordsWithObjectNameSingular.map((record) => {
        const objectMetadataId = morphRelations.find(
          (morphRelation) =>
            morphRelation.targetObjectMetadata.nameSingular ===
            record.objectNameSingular,
        )?.targetObjectMetadata.id;
        if (!objectMetadataId) {
          throw new CustomError(
            'Sorry, we could not determine the correct object type for this related record. Please contact support if the issue persists.',
          );
        }
        return {
          recordId: record.value.id,
          objectMetadataId: objectMetadataId,
          isSelected: true,
          isMatchingSearchFilter: true,
        };
      }),
    );

    openMultipleRecordPicker(dropdownId);

    multipleRecordPickerPerformSearch({
      multipleRecordPickerInstanceId: dropdownId,
      forceSearchFilter: '',
      forceSearchableObjectMetadataItems: relationObjectMetadataItems,
      forcePickableMorphItems: recordsWithObjectNameSingular.map((record) => {
        const objectMetadataId = morphRelations.find(
          (morphRelation) =>
            morphRelation.targetObjectMetadata.nameSingular ===
            record.objectNameSingular,
        )?.targetObjectMetadata.id;
        if (!objectMetadataId) {
          throw new Error('ObjectMetadataId is required');
        }
        return {
          recordId: record.value.id,
          objectMetadataId: objectMetadataId,
          isSelected: true,
          isMatchingSearchFilter: true,
        };
      }),
    });
  };

  const { updateMorphRelationOneToMany } =
    useUpdateMorphRelationOneToManyFieldInput();

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="left-start"
      onClose={handleCloseRelationPickerDropdown}
      onOpen={handleOpenRelationPickerDropdown}
      clickableComponent={
        dropdownTriggerClickableComponent ?? (
          <LightIconButton
            className="displayOnHover"
            Icon={IconPlus}
            accent="tertiary"
          />
        )
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
