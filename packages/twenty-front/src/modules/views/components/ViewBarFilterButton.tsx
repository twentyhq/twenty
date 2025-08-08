import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { Trans } from '@lingui/react/macro';

export const ViewBarFilterButton = () => {
  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  return (
    <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
      <Trans>Filter</Trans>
    </StyledHeaderDropdownButton>
  );
};
