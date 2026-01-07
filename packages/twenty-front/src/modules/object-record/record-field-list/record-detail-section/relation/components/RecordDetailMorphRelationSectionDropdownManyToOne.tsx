import { type ReactNode, useCallback, useContext } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useGetMorphRelationRelatedRecordsWithObjectNameSingular } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useGetMorphRelationRelatedRecordsWithObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { useSingleRecordPickerOpen } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerOpen';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconForbid, IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

type RecordDetailMorphRelationSectionDropdownManyToOneProps = {
  dropdownTriggerClickableComponent?: ReactNode;
};

export const RecordDetailMorphRelationSectionDropdownManyToOne = ({
  dropdownTriggerClickableComponent,
}: RecordDetailMorphRelationSectionDropdownManyToOneProps) => {
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
      morphRelations,
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

    if (!selectedMorphItem?.recordId) return;

    onSubmit?.({
      newValue: {
        id: selectedMorphItem.recordId,
        objectMetadataId: selectedMorphItem.objectMetadataId,
      },
    });
  };

  const { openSingleRecordPicker } = useSingleRecordPickerOpen();

  const handleOpenRelationPickerDropdown = () => {
    setSingleRecordPickerSearchFilter('');
    openSingleRecordPicker(dropdownId);

    if (recordsWithObjectNameSingular.length > 0) {
      setSingleRecordPickerSelectedId(
        recordsWithObjectNameSingular[0]?.value.id,
      );
    }
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
          objectNameSingulars={relationObjectMetadataItems.map(
            (relationObjectMetadataItem) =>
              relationObjectMetadataItem.nameSingular,
          )}
          recordPickerInstanceId={dropdownId}
          onCancel={() => closeDropdown(dropdownId)}
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
