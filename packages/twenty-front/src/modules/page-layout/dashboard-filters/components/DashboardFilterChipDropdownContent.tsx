import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { IconX } from 'twenty-ui/icon';

type DashboardFilterChipDropdownContentProps = {
  slotLabel: string;
  dropdownId: string;
};

export const DashboardFilterChipDropdownContent = ({
  slotLabel,
  dropdownId,
}: DashboardFilterChipDropdownContentProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleCloseClick = () => {
    closeDropdown();
  };

  // The chip's instance holds one ungrouped scratch filter whose id is only fixed once a value exists,
  // so the inputs find it by field like the view bar's add-filter flow instead of by id.
  return (
    <ObjectFilterDropdownContentWrapper>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleCloseClick}
            Icon={IconX}
          />
        }
      >
        {slotLabel}
      </DropdownMenuHeader>
      <ObjectFilterDropdownFilterInput filterDropdownId={dropdownId} />
    </ObjectFilterDropdownContentWrapper>
  );
};
