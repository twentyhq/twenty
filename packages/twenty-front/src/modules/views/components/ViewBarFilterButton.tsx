import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { Trans } from '@lingui/react/macro';
import { LightButton } from 'twenty-ui/components/input';

export const ViewBarFilterButton = () => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );

  return (
    <LightButton data-popup-open={isDropdownOpen ? '' : undefined}>
      <Trans>Filter</Trans>
    </LightButton>
  );
};
