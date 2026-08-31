import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';
import { Trans } from '@lingui/react/macro';

export const ViewBarFilterButton = () => {
  const { mainDropdownId } = useViewBarFilterDropdownIds();

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    mainDropdownId,
  );

  return (
    <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
      <Trans>Filter</Trans>
    </StyledHeaderDropdownButton>
  );
};
