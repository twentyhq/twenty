import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { DashboardFilterValueInput } from '@/page-layout/dashboard-filters/components/DashboardFilterValueInput';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { IconX } from 'twenty-ui/icon';

type DashboardFilterChipDropdownContentProps = {
  slot: DashboardFilterSlot;
};

export const DashboardFilterChipDropdownContent = ({
  slot,
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
        {slot.label}
      </DropdownMenuHeader>
      <DashboardFilterValueInput filterType={slot.filterType} />
    </ObjectFilterDropdownContentWrapper>
  );
};
