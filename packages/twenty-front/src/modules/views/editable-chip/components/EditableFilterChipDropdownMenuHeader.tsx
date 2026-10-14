import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { getTraversedFieldLabel } from '@/object-record/record-field/utils/getTraversedFieldLabel';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { IconX } from 'twenty-ui/icon';

export const EditableFilterChipDropdownMenuHeader = () => {
  const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const relationTargetFieldMetadataIdUsedInDropdown =
    useAtomComponentStateValue(
      relationTargetFieldMetadataIdUsedInDropdownComponentState,
    );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const relationTargetFieldMetadataItem = isDefined(
    relationTargetFieldMetadataIdUsedInDropdown,
  )
    ? getFieldMetadataItemById({
        fieldMetadataId: relationTargetFieldMetadataIdUsedInDropdown,
        objectMetadataItems,
      }).fieldMetadataItem
    : null;

  const label =
    isDefined(fieldMetadataItemUsedInDropdown) &&
    isDefined(relationTargetFieldMetadataItem)
      ? getTraversedFieldLabel({
          relationFieldLabel: fieldMetadataItemUsedInDropdown.label,
          targetFieldLabel: relationTargetFieldMetadataItem.label,
        })
      : fieldMetadataItemUsedInDropdown?.label;

  const { closeDropdown } = useCloseDropdown();

  const handleBackButtonClick = () => {
    closeDropdown();
  };

  return (
    <DropdownMenuHeader
      StartComponent={
        <DropdownMenuHeaderLeftComponent
          onClick={handleBackButtonClick}
          Icon={IconX}
        />
      }
    >
      {label}
    </DropdownMenuHeader>
  );
};
