import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components/navigation';
import { IconPencil, IconX } from 'twenty-ui/icon';

type DashboardFilterChipDropdownContentProps = {
  slotLabel: string;
  dropdownId: string;
  onEditClick?: () => void;
};

export const DashboardFilterChipDropdownContent = ({
  slotLabel,
  dropdownId,
  onEditClick,
}: DashboardFilterChipDropdownContentProps) => {
  const { t } = useLingui();
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
      {isDefined(onEditClick) && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconPencil}
              text={t`Edit`}
              onClick={onEditClick}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </ObjectFilterDropdownContentWrapper>
  );
};
