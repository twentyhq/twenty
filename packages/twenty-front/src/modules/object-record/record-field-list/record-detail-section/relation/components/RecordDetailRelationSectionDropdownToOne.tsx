import { type ReactNode, useCallback, useContext, useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { useSingleRecordPickerOpen } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerOpen';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FieldDependencyContext } from '@/object-record/record-field-dependency/contexts/FieldDependencyContext';
import { useJunctionBridgeFilter } from '@/object-record/record-field/ui/hooks/useJunctionBridgeFilter';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { IconForbid, IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

type RecordDetailRelationSectionDropdownToOneProps = {
  dropdownTriggerClickableComponent?: ReactNode;
};

export const RecordDetailRelationSectionDropdownToOne = ({
  dropdownTriggerClickableComponent,
}: RecordDetailRelationSectionDropdownToOneProps) => {
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();
  const { recordId, fieldDefinition } = useContext(FieldContext);
  assertFieldMetadata(
    FieldMetadataType.RELATION,
    isFieldRelation,
    fieldDefinition,
  );
  const { fieldMetadataId } = fieldDefinition;
  const {
    fieldName,
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
  } = fieldDefinition.metadata;

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

  const fieldValue = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId,
    fieldName,
  }) as ({ id: string } & Record<string, unknown>) | ObjectRecord[] | null;

  const relationRecords: ObjectRecord[] = fieldValue
    ? [fieldValue as ObjectRecord]
    : [];

  const fieldDependencyContext = useContext(FieldDependencyContext);
  const dependencyFilter = fieldDependencyContext?.getFilterForField(fieldName);

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const junctionBridgeFilter = useJunctionBridgeFilter({
    objectMetadataItem,
    fieldMetadataItem,
    recordId,
    objectMetadataItems,
    recordData: recordStore,
  });

  // The dependency filter (e.g. { carrierId: { eq: '...' } }) uses per-object
  // fields not supported by the generic search API's ObjectRecordFilterInput.
  // Resolve it to an id-based filter by querying the target object first.
  const { records: resolvedDependencyRecords } = useFindManyRecords({
    objectNameSingular: relationObjectMetadataNameSingular,
    filter: dependencyFilter as Record<string, unknown> | undefined,
    recordGqlFields: { id: true },
    skip: !isDefined(dependencyFilter),
    limit: 1000,
  });

  const resolvedDependencyFilter = useMemo(():
    | ObjectRecordFilterInput
    | undefined => {
    if (!isDefined(dependencyFilter)) {
      return undefined;
    }

    const ids = resolvedDependencyRecords.map((record) => record.id);

    if (ids.length === 0) {
      return {
        id: { eq: '00000000-0000-0000-0000-000000000000' },
      } as ObjectRecordFilterInput;
    }

    return { id: { in: ids } } as ObjectRecordFilterInput;
  }, [dependencyFilter, resolvedDependencyRecords]);

  const additionalFilter = useMemo((): ObjectRecordFilterInput | undefined => {
    if (
      isDefined(resolvedDependencyFilter) &&
      isDefined(junctionBridgeFilter)
    ) {
      return { and: [resolvedDependencyFilter, junctionBridgeFilter] };
    }
    return resolvedDependencyFilter ?? junctionBridgeFilter;
  }, [resolvedDependencyFilter, junctionBridgeFilter]);

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

  const setSingleRecordPickerSearchFilter = useSetAtomComponentState(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  const setSingleRecordPickerSelectedId = useSetAtomComponentState(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const handleCloseRelationPickerDropdown = useCallback(() => {
    setSingleRecordPickerSearchFilter('');
  }, [setSingleRecordPickerSearchFilter]);

  const { onSubmit } = useContext(FieldInputEventContext);

  const handleRelationPickerEntitySelected = (
    selectedMorphItem?: RecordPickerPickableMorphItem,
  ) => {
    closeDropdown(dropdownId);

    if (!selectedMorphItem?.recordId || !relationFieldMetadataItem?.name)
      return;

    onSubmit?.({ newValue: { id: selectedMorphItem.recordId } });
  };

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      fieldMetadataItem,
      objectMetadataItem,
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
        dropdownTriggerClickableComponent ?? (
          <LightIconButton
            className="displayOnHover"
            Icon={IconPencil}
            accent="tertiary"
          />
        )
      }
      dropdownComponents={
        <SingleRecordPicker
          focusId={dropdownId}
          componentInstanceId={dropdownId}
          EmptyIcon={IconForbid}
          onMorphItemSelected={handleRelationPickerEntitySelected}
          objectNameSingulars={[relationObjectMetadataNameSingular]}
          recordPickerInstanceId={dropdownId}
          onCancel={() => closeDropdown(dropdownId)}
          onCreate={shouldAllowCreateNew ? handleCreateNew : undefined}
          layoutDirection={
            dropdownPlacement?.includes('end')
              ? 'search-bar-on-bottom'
              : 'search-bar-on-top'
          }
          additionalFilter={additionalFilter}
        />
      }
    />
  );
};
