import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { Trans } from '@lingui/react/macro';
import { useIsDropdownOpen } from '@/ui/layout/dropdown/hooks/useIsDropdownOpen';

export const ViewBarFilterButton = () => {
  const isDropdownOpen = useIsDropdownOpen(ViewBarFilterDropdownIds.MAIN);

  return (
    <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
      <Trans>Filter</Trans>
    </StyledHeaderDropdownButton>
  );
};
