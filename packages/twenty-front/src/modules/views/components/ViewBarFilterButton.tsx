import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { Trans } from '@lingui/react/macro';

export const ViewBarFilterButton = () => {
  const isDropdownOpen = useRecoilComponentValueV2(
    isDropdownOpenComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  return (
    <StyledHeaderDropdownButton isUnfolded={isDropdownOpen}>
      <Trans>Filter</Trans>
    </StyledHeaderDropdownButton>
  );
};
