import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { IconX } from 'twenty-ui/icon';

type DashboardFilterChipDropdownContentProps = {
  slotLabel: string;
  dropdownId: string;
  recordFilterId: string;
};

export const DashboardFilterChipDropdownContent = ({
  slotLabel,
  dropdownId,
  recordFilterId,
}: DashboardFilterChipDropdownContentProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleCloseClick = () => {
    closeDropdown();
  };

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
      <ObjectFilterDropdownFilterInput
        filterDropdownId={dropdownId}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
