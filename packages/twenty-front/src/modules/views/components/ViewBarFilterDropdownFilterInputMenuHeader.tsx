import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { IconChevronLeft } from 'twenty-ui/display';

export const ViewBarFilterDropdownFilterInputMenuHeader = () => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentSelectorValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { resetFilterDropdown } = useResetFilterDropdown();

  const handleBackButtonClick = () => {
    resetFilterDropdown();
  };

  return (
    <DropdownMenuHeader
      StartComponent={
        <DropdownMenuHeaderLeftComponent
          onClick={handleBackButtonClick}
          Icon={IconChevronLeft}
        />
      }
    >
      {fieldMetadataItemUsedInDropdown?.label}
    </DropdownMenuHeader>
  );
};
