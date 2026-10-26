import { type ReactElement, useCallback, useContext } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useCreateJunctionRecordWithNestedTarget } from '@/object-record/record-field/ui/hooks/useCreateJunctionRecordWithNestedTarget';
import { useUpdateJunctionRelationFromCell } from '@/object-record/record-field/ui/hooks/useUpdateJunctionRelationFromCell';
import { useAddNewRecordAndOpenSidePanel } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenSidePanel';
import { useUpdateRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateRelationOneToManyFieldInput';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getJunctionRelationPickerData } from '@/object-record/record-field/ui/utils/junction/getJunctionRelationPickerData';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

type RecordDetailRelationSectionDropdownToManyProps = {
  dropdownTriggerClickableComponent: ReactElement;
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

  if (!isDefined(fieldMetadataItem) || !isDefined(objectMetadataItem)) {
    throw new CustomError(
      doNotTranslate('Field metadata item or object metadata item not found'),
      'FIELD_METADATA_ITEM_OR_OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }

  const relationFieldDefinition =
    fieldDefinition as FieldDefinition<FieldRelationMetadata>;

  const { updateJunctionRelationFromCell, junctionConfig } =
    useUpdateJunctionRelationFromCell({
      fieldMetadataItem,
      fieldDefinition: relationFieldDefinition,
      recordId,
    });

  const isJunctionRelation = isUsableJunctionConfig(junctionConfig);
  const isInvalidJunctionRelation =
    isDefined(junctionConfig) && !isJunctionRelation;

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );
  if (!relationFieldMetadataItem) {
    throw new CustomError(
      doNotTranslate('Relation field metadata item not found'),
      'RELATION_FIELD_METADATA_ITEM_NOT_FOUND',
    );
  }

  const fieldValue = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId,
    fieldName,
  }) as ({ id: string } & Record<string, unknown>) | ObjectRecord[] | null;

  const relationRecords: ObjectRecord[] = (fieldValue as ObjectRecord[]) ?? [];

  const { pickableMorphItems, searchableObjectMetadataItems } = isDefined(
    junctionConfig,
  )
    ? getJunctionRelationPickerData({
        junctionRecords: relationRecords,
        targetFields: junctionConfig.targetFields,
        objectMetadataItems,
      })
    : {
        pickableMorphItems: relationRecords.map(({ id: recordId }) => ({
          recordId,
          objectMetadataId: relationObjectMetadataItem.id,
          isSelected: true,
          isMatchingSearchFilter: true,
        })),
        searchableObjectMetadataItems: [relationObjectMetadataItem],
      };

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
    instanceId: scopeInstanceId,
  });

  const { closeDropdown } = useCloseDropdown();

  const setMultipleRecordPickerPickableMorphItems = useSetAtomComponentState(
    multipleRecordPickerPickableMorphItemsComponentState,
    dropdownId,
  );

  const setMultipleRecordPickerSearchableObjectMetadataItems =
    useSetAtomComponentState(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState,
      dropdownId,
    );

  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const { updateRelation } = useUpdateRelationOneToManyFieldInput();

  const { createNewRecordAndOpenSidePanel } = useAddNewRecordAndOpenSidePanel({
    fieldMetadataItem,
    objectMetadataItem,
    relationObjectMetadataNameSingular,
    relationObjectMetadataItem,
    relationFieldMetadataItem,
    recordId,
  });

  const {
    createJunctionRecordWithNestedTarget,
    loading: isCreatingJunctionRecord,
  } = useCreateJunctionRecordWithNestedTarget({
    sourceRecordId: recordId,
    sourceFieldName: fieldName,
    sourceObjectMetadataItem: objectMetadataItem,
    junctionConfig: isJunctionRelation ? junctionConfig : undefined,
  });

  const handleOpenRelationPickerDropdown = () => {
    setMultipleRecordPickerSearchableObjectMetadataItems(
      searchableObjectMetadataItems,
    );
    setMultipleRecordPickerPickableMorphItems(pickableMorphItems);

    openMultipleRecordPicker(dropdownId);

    multipleRecordPickerPerformSearch({
      multipleRecordPickerInstanceId: dropdownId,
      forceSearchFilter: '',
      forceSearchableObjectMetadataItems: searchableObjectMetadataItems,
      forcePickableMorphItems: pickableMorphItems,
    });
  };

  const handleCreateNew = useCallback(
    async ({
      searchInput,
      objectMetadataItemId,
    }: {
      searchInput?: string;
      objectMetadataItemId: string;
    }) => {
      if (isJunctionRelation) {
        return createJunctionRecordWithNestedTarget({
          searchInput,
          targetObjectMetadataItemId: objectMetadataItemId,
        });
      }

      closeDropdown(dropdownId);
      await createNewRecordAndOpenSidePanel?.(searchInput);

      return undefined;
    },
    [
      closeDropdown,
      createNewRecordAndOpenSidePanel,
      createJunctionRecordWithNestedTarget,
      dropdownId,
      isJunctionRelation,
    ],
  );

  const handleChange = useCallback(
    (morphItem: Parameters<typeof updateRelation>[0]) => {
      if (isJunctionRelation) {
        updateJunctionRelationFromCell({ morphItem });
      } else {
        updateRelation(morphItem);
      }
    },
    [isJunctionRelation, updateJunctionRelationFromCell, updateRelation],
  );

  if (isInvalidJunctionRelation) {
    return null;
  }

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      multiple
      onOpenChange={(open) => {
        if (open) {
          handleOpenRelationPickerDropdown();
        }
      }}
    >
      <Dropdown.Trigger render={dropdownTriggerClickableComponent} />
      <DropdownContent
        side="left"
        align="start"
        aria-label={fieldDefinition.label}
      >
        <MultipleRecordPicker
          componentInstanceId={dropdownId}
          onCreate={
            isJunctionRelation || isDefined(createNewRecordAndOpenSidePanel)
              ? handleCreateNew
              : undefined
          }
          isCreatePending={isCreatingJunctionRecord}
          onChange={handleChange}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
