import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/display';
import { isRtl } from '~/localization/utils/isRtl';

export const ViewBarFilterDropdownAnyFieldSearchInputDropdownHeader = () => {
  const { t } = useLingui();

  const { resetFilterDropdown } = useResetFilterDropdown();

  const handleBackButtonClick = () => {
    resetFilterDropdown();
  };

  return (
    <DropdownMenuHeader
      StartComponent={
        <DropdownMenuHeaderLeftComponent
          onClick={handleBackButtonClick}
          Icon={isRtl() ? IconChevronRight : IconChevronLeft}
        />
      }
    >
      {t`Search any field`}
    </DropdownMenuHeader>
  );
};
