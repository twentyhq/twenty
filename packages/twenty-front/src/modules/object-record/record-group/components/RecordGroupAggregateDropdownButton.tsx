import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type Nullable } from 'twenty-shared/types';
import { Dropdown } from 'twenty-ui/components/navigation';
import { LightButton } from 'twenty-ui/components/input';
import { isDefined } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

export const RecordGroupAggregateDropdownButton = ({
  dropdownId,
  value,
  tooltip,
}: {
  dropdownId: string;
  value?: Nullable<string | number>;
  tooltip?: Nullable<string>;
}) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  return (
    <Tooltip
      content={tooltip ?? ''}
      side="right"
      positionMethod="fixed"
      delay={TooltipDelay.mediumDelay}
      disabled={isDropdownOpen}
    >
      <Dropdown.Trigger id={dropdownId} render={<LightButton />}>
        {isDefined(value) ? value.toString() : '-'}
      </Dropdown.Trigger>
    </Tooltip>
  );
};
