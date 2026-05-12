import { useStore } from 'jotai';
import { type ReactNode, useCallback, useContext } from 'react';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useUpdateJunctionRelationFromCell } from '@/object-record/record-field/ui/hooks/useUpdateJunctionRelationFromCell';
import { useAddNewRecordAndOpenSidePanel } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenSidePanel';
import { useUpdateRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateRelationOneToManyFieldInput';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import {
  computeRelationGqlFieldJoinColumnName,
  CustomError,
  isDefined,
} from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

type RecordDetailRelationSectionDropdownToManyProps = {
  dropdownTriggerClickableComponent?: ReactNode;
};

export const RecordDetailRelationSectionDropdownToMany = ({
  dropdownTriggerClickableComponent,
}: RecordDetailRelationSectionDropdownToManyProps) => {
  const store = useStore();
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
      'Field metadata item or object metadata item not found',
      'FIELD_METADATA_ITEM_OR_OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }

  const isJunctionRelation = hasJunctionConfig(fieldMetadataItem.settings);

  const relationFieldDefinition =
    fieldDefinition as FieldDefinition<FieldRelationMetadata>;

  const { updateJunctionRelationFromCell, isJunctionConfigValid } =
    useUpdateJunctionRelationFromCell({
      fieldMetadataItem,
      fieldDefinition: relationFieldDefinition,
      recordId,
    });

  const junctionConfig =
    isJunctionRelation && isJunctionConfigValid
      ? getJunctionConfig({
          settings: fieldMetadataItem.settings,
          relationObjectMetadataId:
            relationFieldDefinition.metadata.relationObjectMetadataId,
          sourceObjectMetadataId: objectMetadataItem.id,
          objectMetadataItems,
        })
      : null;

  const firstJunctionTargetField =
    junctionConfig && !junctionConfig.isMorphRelation
      ? junctionConfig.targetFields[0]
      : undefined;

  const junctionTargetObjectMetadata = objectMetadataItems.find(
    (item) =>
      item.id === firstJunctionTargetField?.relation?.targetObjectMetadata.id,
  );

  const isMorphJunction = junctionConfig?.isMorphRelation ?? false;

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const pickerObjectMetadataItem =
    isJunctionRelation && isDefined(junctionTargetObjectMetadata)
      ? junctionTargetObjectMetadata
      : relationObjectMetadataItem;

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );
  if (!relationFieldMetadataItem) {
    throw new CustomError(
      'Relation field metadata item not found',
      'RELATION_FIELD_METADATA_ITEM_NOT_FOUND',
    );
  }

  const fieldValue = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId,
    fieldName,
  }) as ({ id: string } & Record<string, unknown>) | ObjectRecord[] | null;

  const relationRecords: ObjectRecord[] = (fieldValue as ObjectRecord[]) ?? [];

  const pickerRecords =
    isJunctionRelation &&
    isDefined(junctionConfig) &&
    isDefined(junctionTargetObjectMetadata)
      ? extractTargetRecordsFromJunction({
          junctionRecords: relationRecords,
          targetFields: junctionConfig.targetFields,
          objectMetadataItems,
        }).map((extracted) => ({
          recordId: extracted.recordId,
          objectMetadataId: extracted.objectMetadataId,
        }))
      : relationRecords.map((record) => ({
          recordId: record.id,
          objectMetadataId: pickerObjectMetadataItem.id,
        }));

  const dropdownId = getRecordFieldCardRelationPickerDropdownId({
    fieldDefinition,
    recordId,
    instanceId: scopeInstanceId,
  });

  const { closeDropdown } = useCloseDropdown();

  const dropdownPlacement = useAtomComponentStateValue(
    dropdownPlacementComponentState,
    dropdownId,
  );

  const setMultipleRecordPickerSearchFilter = useSetAtomComponentState(
    multipleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const setMultipleRecordPickerPickableMorphItems = useSetAtomComponentState(
    multipleRecordPickerPickableMorphItemsComponentState,
    dropdownId,
  );

  const setMultipleRecordPickerSearchableObjectMetadataItems =
    useSetAtomComponentState(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState,
      dropdownId,
    );

  const multipleRecordPickerPickableMorphItemsCallbackState =
    useAtomComponentStateCallbackState(
      multipleRecordPickerPickableMorphItemsComponentState,
      dropdownId,
    );

  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setMultipleRecordPickerSearchFilter('');
  }, [setMultipleRecordPickerSearchFilter]);

  const { updateRelation } = useUpdateRelationOneToManyFieldInput();

  const { createNewRecordAndOpenSidePanel } = useAddNewRecordAndOpenSidePanel({
    fieldMetadataItem,
    objectMetadataItem,
    relationObjectMetadataNameSingular,
    relationObjectMetadataItem,
    relationFieldMetadataItem,
    recordId,
  });

  const { createOneRecord: createTargetRecord } = useCreateOneRecord({
    objectNameSingular:
      junctionTargetObjectMetadata?.nameSingular ??
      relationObjectMetadataNameSingular,
  });

  const { createOneRecord: createJunctionRecord } = useCreateOneRecord({
    objectNameSingular:
      junctionConfig?.junctionObjectMetadata?.nameSingular ??
      relationObjectMetadataNameSingular,
  });

  const handleOpenRelationPickerDropdown = () => {
    const pickableMorphItems = pickerRecords.map((item) => ({
      recordId: item.recordId,
      objectMetadataId: item.objectMetadataId,
      isSelected: true,
      isMatchingSearchFilter: true,
    }));

    setMultipleRecordPickerSearchableObjectMetadataItems([
      pickerObjectMetadataItem,
    ]);
    setMultipleRecordPickerSearchFilter('');
    setMultipleRecordPickerPickableMorphItems(pickableMorphItems);

    openMultipleRecordPicker(dropdownId);

    multipleRecordPickerPerformSearch({
      multipleRecordPickerInstanceId: dropdownId,
      forceSearchFilter: '',
      forceSearchableObjectMetadataItems: [pickerObjectMetadataItem],
      forcePickableMorphItems: pickableMorphItems,
    });
  };

  const handleCreateNew = useCallback(
    async (searchString?: string) => {
      const updatePickerState = (
        newRecordId: string,
        targetObjectMetadataId: string,
      ) => {
        const currentMorphItems = store.get(
          multipleRecordPickerPickableMorphItemsCallbackState,
        );

        const newMorphItems = currentMorphItems.concat({
          recordId: newRecordId,
          objectMetadataId: targetObjectMetadataId,
          isSelected: true,
          isMatchingSearchFilter: true,
        });

        store.set(
          multipleRecordPickerPickableMorphItemsCallbackState,
          newMorphItems,
        );

        multipleRecordPickerPerformSearch({
          multipleRecordPickerInstanceId: dropdownId,
          forceSearchFilter: searchString,
          forceSearchableObjectMetadataItems: [pickerObjectMetadataItem],
          forcePickableMorphItems: newMorphItems,
        });
      };

      if (
        isJunctionRelation &&
        isDefined(junctionConfig) &&
        !isMorphJunction &&
        isDefined(junctionTargetObjectMetadata)
      ) {
        const { targetFields, sourceField } = junctionConfig;
        const targetField = targetFields[0];

        if (!isDefined(targetField) || !isDefined(sourceField)) {
          return;
        }

        const sourceJoinColumnName = getSourceJoinColumnName({
          sourceField,
          sourceObjectMetadata: objectMetadataItem,
        });

        const targetJoinColumnName = computeRelationGqlFieldJoinColumnName({
          name: targetField.name,
        });

        if (!sourceJoinColumnName) {
          return;
        }

        const newTargetId = v4();
        const targetPayload = buildRecordLabelPayload({
          id: newTargetId,
          searchInput: searchString,
          objectMetadataItem: junctionTargetObjectMetadata,
        });

        await createTargetRecord(targetPayload);

        const newJunctionId = v4();
        const createdJunction = await createJunctionRecord({
          id: newJunctionId,
          [sourceJoinColumnName]: recordId,
          [targetJoinColumnName]: newTargetId,
        });

        if (isDefined(createdJunction)) {
          store.set(
            recordStoreFamilyState.atomFamily(recordId),
            (currentRecord: ObjectRecord | null | undefined) => {
              if (!isDefined(currentRecord)) {
                return currentRecord;
              }
              const currentFieldValue = currentRecord[fieldName];
              const updatedJunctionRecords = Array.isArray(currentFieldValue)
                ? [...currentFieldValue, createdJunction]
                : [createdJunction];

              return {
                ...currentRecord,
                [fieldName]: updatedJunctionRecords,
              } as ObjectRecord;
            },
          );
        }

        updatePickerState(newTargetId, junctionTargetObjectMetadata.id);
        return;
      }

      closeDropdown(dropdownId);
      createNewRecordAndOpenSidePanel?.(searchString);
    },
    [
      closeDropdown,
      createJunctionRecord,
      createNewRecordAndOpenSidePanel,
      createTargetRecord,
      dropdownId,
      fieldName,
      isMorphJunction,
      isJunctionRelation,
      junctionConfig,
      junctionTargetObjectMetadata,
      multipleRecordPickerPickableMorphItemsCallbackState,
      multipleRecordPickerPerformSearch,
      objectMetadataItem,
      pickerObjectMetadataItem,
      recordId,
      store,
    ],
  );

  const canCreateNew = !isMorphJunction;

  const objectMetadataItemIdForCreate =
    isJunctionRelation && isDefined(junctionTargetObjectMetadata)
      ? junctionTargetObjectMetadata.id
      : relationObjectMetadataItem.id;

  const handleChange = useCallback(
    (morphItem: Parameters<typeof updateRelation>[0]) => {
      if (isJunctionRelation && isJunctionConfigValid) {
        updateJunctionRelationFromCell({ morphItem });
      } else {
        updateRelation(morphItem);
      }
    },
    [
      isJunctionRelation,
      isJunctionConfigValid,
      updateJunctionRelationFromCell,
      updateRelation,
    ],
  );

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
          onCreate={canCreateNew ? handleCreateNew : undefined}
          objectMetadataItemIdForCreate={objectMetadataItemIdForCreate}
          onChange={handleChange}
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
