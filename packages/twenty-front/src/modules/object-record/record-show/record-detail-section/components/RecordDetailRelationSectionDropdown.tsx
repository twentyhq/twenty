import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { useUpdateRelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationFromManyFieldInput';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { IconForbid, IconPencil, IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

type RecordDetailRelationSectionDropdownProps = {
  loading: boolean;
};

export const RecordDetailRelationSectionDropdown = ({
  loading,
}: RecordDetailRelationSectionDropdownProps) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const record = useRecoilValue(recordStoreFamilyState(recordId));

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

  // TODO: use new relation type
  const isToOneObject = relationType === RelationDefinitionType.MANY_TO_ONE;
  const isToManyObjects = relationType === RelationDefinitionType.ONE_TO_MANY;

  const relationRecords: ObjectRecord[] =
    fieldValue && isToOneObject
      ? [fieldValue as ObjectRecord]
      : ((fieldValue as ObjectRecord[]) ?? []);

  const dropdownId = `record-field-card-relation-picker-${fieldDefinition.fieldMetadataId}-${recordId}`;

  const { closeDropdown, dropdownPlacement } = useDropdown(dropdownId);

  const setMultipleRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    multipleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const setMultipleRecordPickerPickableMorphItems =
    useSetRecoilComponentStateV2(
      multipleRecordPickerPickableMorphItemsComponentState,
      dropdownId,
    );

  const setMultipleRecordPickerSearchableObjectMetadataItems =
    useSetRecoilComponentStateV2(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState,
      dropdownId,
    );

  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const setSingleRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const setSingleRecordPickerSelectedId = useSetRecoilComponentStateV2(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setMultipleRecordPickerSearchFilter('');
  }, [setMultipleRecordPickerSearchFilter]);

  const persistField = usePersistField();
  const { updateOneRecord: updateOneRelationRecord } = useUpdateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const handleRelationPickerEntitySelected = (
    selectedRelationEntity?: SingleRecordPickerRecord,
  ) => {
    closeDropdown();

    if (!selectedRelationEntity?.id || !relationFieldMetadataItem?.name) return;

    if (isToOneObject) {
      persistField(selectedRelationEntity.record);
      return;
    }

    updateOneRelationRecord({
      idToUpdate: selectedRelationEntity.id,
      updateOneRecordInput: {
        [relationFieldMetadataItem.name]: record,
      },
    });
  };

  const { updateRelation } = useUpdateRelationFromManyFieldInput();

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
  });

  const isFieldReadOnly = useIsFieldValueReadOnly({
    fieldDefinition,
    isRecordReadOnly,
  });

  if (loading || isFieldReadOnly) return null;

  const handleOpenRelationPickerDropdown = () => {
    if (isToOneObject) {
      setSingleRecordPickerSearchFilter('');
      if (relationRecords.length > 0) {
        setSingleRecordPickerSelectedId(relationRecords[0].id);
      }
    }

    if (isToManyObjects) {
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
    }
  };

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
            Icon={isToOneObject ? IconPencil : IconPlus}
            accent="tertiary"
          />
        }
        dropdownHotkeyScope={{ scope: dropdownId }}
        dropdownComponents={
          isToOneObject ? (
            <SingleRecordPicker
              componentInstanceId={dropdownId}
              EmptyIcon={IconForbid}
              onRecordSelected={handleRelationPickerEntitySelected}
              objectNameSingular={relationObjectMetadataNameSingular}
              recordPickerInstanceId={dropdownId}
              onCreate={createNewRecordAndOpenRightDrawer}
              onCancel={closeDropdown}
              layoutDirection={
                dropdownPlacement?.includes('end')
                  ? 'search-bar-on-bottom'
                  : 'search-bar-on-top'
              }
            />
          ) : (
            <MultipleRecordPicker
              componentInstanceId={dropdownId}
              onCreate={() => {
                closeDropdown();
                createNewRecordAndOpenRightDrawer?.();
              }}
              onChange={updateRelation}
              onSubmit={closeDropdown}
              onClickOutside={closeDropdown}
              layoutDirection={
                dropdownPlacement?.includes('end')
                  ? 'search-bar-on-bottom'
                  : 'search-bar-on-top'
              }
            />
          )
        }
      />
    </DropdownScope>
  );
};
