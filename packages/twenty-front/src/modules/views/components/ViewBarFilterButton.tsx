import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { Trans } from '@lingui/react/macro';

export const ViewBarFilterButton = () => {
  const isDropdownOpen = useAtomComponentValue(
    isDropdownOpenComponentState,
    ViewBarFilterDropdownIds.MAIN,
  );

  return (
    <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
      <Trans>Filter</Trans>
    </StyledHeaderDropdownButton>
  );
};
