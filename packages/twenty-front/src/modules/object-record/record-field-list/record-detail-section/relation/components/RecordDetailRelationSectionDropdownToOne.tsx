import { type ReactNode, useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { FieldMetadataType } from 'twenty-shared/types';
import { CustomError } from 'twenty-shared/utils';
import { IconForbid, IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

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

  const fieldValue = useRecoilValue<
    ({ id: string } & Record<string, any>) | ObjectRecord[] | null
  >(recordStoreFamilySelector({ recordId, fieldName }));

  const relationRecords: ObjectRecord[] = fieldValue
    ? [fieldValue as ObjectRecord]
    : [];

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
        />
      }
    />
  );
};
