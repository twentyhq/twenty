import { HeaderDropdownButton } from '@/ui/layout/dropdown/components/HeaderDropdownButton';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { Trans } from '@lingui/react/macro';

export const ViewBarFilterButton = () => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    ViewBarFilterDropdownIds.MAIN,
  );

  return (
    <HeaderDropdownButton isUnfolded={isDropdownOpen}>
      <Trans>Filter</Trans>
    </HeaderDropdownButton>
  );
};
