import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { IconX } from 'twenty-ui/display';

export const EditableFilterChipDropdownMenuHeader = () => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentSelectorValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

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
      {fieldMetadataItemUsedInDropdown?.label}
    </DropdownMenuHeader>
  );
};
