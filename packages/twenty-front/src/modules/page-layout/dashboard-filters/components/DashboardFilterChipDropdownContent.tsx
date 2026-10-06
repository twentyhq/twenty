import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { getDashboardFilterSlotRecordFilterId } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/icon';

type DashboardFilterChipDropdownContentProps = {
  slot: DashboardFilterSlot;
  dropdownId: string;
};

// The regular filter input dispatches on the seeded representative field, whose type matches the slot by construction.
export const DashboardFilterChipDropdownContent = ({
  slot,
  dropdownId,
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
      <ObjectFilterDropdownFilterInput
        filterDropdownId={dropdownId}
        recordFilterId={getDashboardFilterSlotRecordFilterId(slot.id)}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
