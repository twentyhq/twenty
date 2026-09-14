import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAddRecordGroup } from '@/object-record/record-group/hooks/useAddRecordGroup';
import { canAddRecordGroupForFieldMetadataItem } from '@/object-record/record-group/utils/canAddRecordGroupForFieldMetadataItem';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

type AddRecordGroupButtonProps = {
  fieldMetadataItem: FieldMetadataItem;
  dropdownId: string;
  dropdownOffset?: DropdownOffset;
};

export const AddRecordGroupButton = ({
  fieldMetadataItem,
  dropdownId,
  dropdownOffset,
}: AddRecordGroupButtonProps) => {
  const { currentView } = useGetCurrentViewOnly();
  const { addRecordGroup } = useAddRecordGroup();
  const { closeDropdown } = useCloseDropdown();

  const targetObjectNameSingular =
    fieldMetadataItem.relation?.targetObjectMetadata.nameSingular;

  if (
    !canAddRecordGroupForFieldMetadataItem(fieldMetadataItem) ||
    !isDefined(targetObjectNameSingular)
  ) {
    return null;
  }

  const excludedRecordIds = (currentView?.viewGroups ?? [])
    .map((viewGroup) => viewGroup.fieldValue)
    .filter(isNonEmptyString);

  const handleRecordSelected = async (
    selectedItem?: RecordPickerPickableMorphItem,
  ) => {
    closeDropdown(dropdownId);

    if (isDefined(selectedItem?.recordId)) {
      await addRecordGroup(selectedItem.recordId);
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      dropdownOffset={dropdownOffset}
      clickableComponent={
        <Button
          startIcon={<IconPlus />}
          size="sm"
          variant="ghost"
          style={{
            fontWeight: 'var(--t-font-weight-regular)',
            color: 'var(--t-font-color-tertiary)',
          }}
        >{t`New group`}</Button>
      }
      dropdownComponents={
        <SingleRecordPicker
          focusId={dropdownId}
          componentInstanceId={dropdownId}
          onCancel={() => closeDropdown(dropdownId)}
          onMorphItemSelected={handleRecordSelected}
          objectNameSingulars={[targetObjectNameSingular]}
          excludedRecordIds={excludedRecordIds}
        />
      }
    />
  );
};
