import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { LightButton, type LightButtonProps } from 'twenty-ui/components/input';

type DropdownButtonProps = LightButtonProps;

export const DropdownButton = (props: DropdownButtonProps) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );

  return (
    <LightButton
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      data-popup-open={isDropdownOpen ? '' : undefined}
    />
  );
};
