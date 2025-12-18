import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { Trans } from '@lingui/react/macro';

export const ViewBarFilterButton = () => {
  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    ViewBarFilterDropdownIds.MAIN,
  );

  return (
    <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
      <Trans>Filter</Trans>
    </StyledHeaderDropdownButton>
  );
};
