import { t } from '@lingui/core/macro';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { type Placement } from '@floating-ui/react';
import { type MouseEvent, type ReactNode } from 'react';
import { type IconComponent, IconDotsVertical } from 'twenty-ui/icon';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type MenuItemWithOptionDropdownProps = {
  accent?: 'default' | 'danger' | 'placeholder';
  className?: string;
  dropdownContent: ReactNode;
  dropdownId: string;
  isIconDisplayedOnHoverOnly?: boolean;
  LeftIcon?: IconComponent | null;
  RightIcon?: IconComponent | null;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  text: ReactNode;
  hasSubMenu?: boolean;
  dropdownPlacement?: Placement;
  selected?: boolean;
};

export const MenuItemWithOptionDropdown = ({
  accent = 'default',
  className,
  isIconDisplayedOnHoverOnly = true,
  dropdownContent,
  dropdownId,
  LeftIcon,
  RightIcon,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  text,
  hasSubMenu = false,
  dropdownPlacement = 'bottom-end',
  selected = false,
}: MenuItemWithOptionDropdownProps) => (
  <ListItem
    data-testid={testId}
    onClick={
      isDefined(onClick)
        ? (event) => {
            event.preventDefault();
            onClick(event);
          }
        : undefined
    }
    className={className}
    color={accent === 'danger' ? 'danger' : 'neutral'}
    style={{
      color:
        accent === 'placeholder'
          ? themeCssVariables.font.color.tertiary
          : undefined,
    }}
    actionsVisibility={isIconDisplayedOnHoverOnly ? 'hover' : 'always'}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    selected={selected}
    startIcon={<ListItemIcon icon={LeftIcon} />}
    hasSubmenu={hasSubMenu}
    actions={
      <Dropdown
        clickableComponent={
          <LightIconButton
            size="sm"
            emphasis="subtle"
            aria-label={t`More options`}
          >
            {isDefined(RightIcon) ? <RightIcon /> : <IconDotsVertical />}
          </LightIconButton>
        }
        dropdownPlacement={dropdownPlacement}
        dropdownComponents={dropdownContent}
        dropdownId={dropdownId}
      />
    }
  >
    {text}
  </ListItem>
);
