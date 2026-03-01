import { type ReactNode, useCallback, useContext, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { useUpdateRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateRelationOneToManyFieldInput';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerAdditionalFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerAdditionalFilterComponentState';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

type RecordDetailRelationSectionDropdownToManyProps = {
  dropdownTriggerClickableComponent?: ReactNode;
};

export const RecordDetailRelationSectionDropdownToMany = ({
  dropdownTriggerClickableComponent,
}: RecordDetailRelationSectionDropdownToManyProps) => {
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { fieldMetadataId } = fieldDefinition;
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const { objectMetadataItems } = useObjectMetadataItems();
  const { fieldMetadataItem, objectMetadataItem } = getFieldMetadataItemById({
    fieldMetadataId,
    objectMetadataItems,
  });

  if (!fieldMetadataItem || !objectMetadataItem) {
    throw new CustomError(
      'Field metadata item or object metadata item not found',
      'FIELD_METADATA_ITEM_OR_OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );
  if (!relationFieldMetadataItem) {
    throw new CustomError(
      'Relation field metadata item not found',
      'RELATION_FIELD_METADATA_ITEM_NOT_FOUND',
    );
  }

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | ObjectRecord[] | null
  >(recordStoreFamilySelector({ recordId, fieldName }));

  const relationRecords: ObjectRecord[] = (fieldValue as ObjectRecord[]) ?? [];

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

  const setMultipleRecordPickerAdditionalFilter = useSetRecoilComponentState(
    multipleRecordPickerAdditionalFilterComponentState,
    dropdownId,
  );

  // Pre-fetch IDs of related records that are either unattached (inverse FK is
  // null) or already linked to this record. The search API only accepts generic
  // filters (id, createdAt, etc.), so we resolve eligible IDs here and pass an
  // id-based filter instead.
  const inverseFieldName = relationFieldMetadataItem.name;

  const { records: eligibleRecords } = useFindManyRecords({
    objectNameSingular: relationObjectMetadataNameSingular,
    filter: {
      or: [
        { [`${inverseFieldName}Id`]: { is: 'NULL' } },
        { [`${inverseFieldName}Id`]: { eq: recordId } },
      ],
    },
    limit: 1000,
  });

  const excludeAttachedFilter = useMemo((): ObjectRecordFilterInput => {
    const eligibleIds = eligibleRecords.map((record) => record.id);

    if (eligibleIds.length === 0) {
      return {
        id: { eq: '00000000-0000-0000-0000-000000000000' },
      } as ObjectRecordFilterInput;
    }

    return { id: { in: eligibleIds } } as ObjectRecordFilterInput;
  }, [eligibleRecords]);

  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setMultipleRecordPickerSearchFilter('');
  }, [setMultipleRecordPickerSearchFilter]);

  const { updateRelation } = useUpdateRelationOneToManyFieldInput();

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      fieldMetadataItem,
      objectMetadataItem,
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
    setMultipleRecordPickerAdditionalFilter(excludeAttachedFilter);
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
          additionalFilter={excludeAttachedFilter}
          onCreate={
            isDefined(createNewRecordAndOpenRightDrawer)
              ? handleCreateNew
              : undefined
          }
          objectMetadataItemIdForCreate={relationObjectMetadataItem.id}
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
