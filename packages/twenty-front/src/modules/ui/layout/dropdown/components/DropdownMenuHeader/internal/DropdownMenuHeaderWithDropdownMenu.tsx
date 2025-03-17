import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { IconComponent, IconDotsVertical, LightIconButton } from 'twenty-ui';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import { Placement } from '@floating-ui/react';
import { ReactNode } from 'react';

export type DropdownMenuHeaderWithDropdownMenuProps = {
  EndIcon?: IconComponent;
  dropdownPlacement?: Placement;
  dropdownComponents: ReactNode;
  dropdownId: string;
};

export const DropdownMenuHeaderWithDropdownMenu = (
  props: DropdownMenuHeaderWithDropdownMenuProps,
) => {
  return (
    <div className="hoverable-buttons">
      <Dropdown
        clickableComponent={
          <LightIconButton
            Icon={props.EndIcon ?? IconDotsVertical}
            size="small"
            accent="tertiary"
          />
        }
        dropdownPlacement={props.dropdownPlacement ?? 'bottom-end'}
        dropdownComponents={props.dropdownComponents}
        dropdownId={props.dropdownId}
        dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
      />
    </div>
  );
};
