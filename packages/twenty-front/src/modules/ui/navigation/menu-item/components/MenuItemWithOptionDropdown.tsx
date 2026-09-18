import { t } from '@lingui/core/macro';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { type Placement } from '@floating-ui/react';
import { type MouseEvent, type ReactNode, useContext } from 'react';
import {
  IconChevronRight,
  type IconComponent,
  IconDotsVertical,
} from 'twenty-ui/icon';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import {
  type MenuItemAccent,
  MenuItemLeftContent,
  StyledHoverableMenuItemBase,
  StyledMenuItemLeftContent,
} from 'twenty-ui/primitives/navigation';
import { ThemeContext } from 'twenty-ui/theme-constants';

export type MenuItemWithOptionDropdownProps = {
  accent?: MenuItemAccent;
  className?: string;
  dropdownContent: ReactNode;
  dropdownId: string;
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
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

// TODO: refactor this
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
}: MenuItemWithOptionDropdownProps) => {
  const { theme } = useContext(ThemeContext);
  const handleMenuItemClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={handleMenuItemClick}
      className={className}
      accent={accent}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      focused={selected}
    >
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent LeftIcon={LeftIcon ?? undefined} text={text} />
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
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
      </div>
      {hasSubMenu && (
        <IconChevronRight
          size={theme.icon.size.sm}
          color={theme.font.color.tertiary}
        />
      )}
    </StyledHoverableMenuItemBase>
  );
};
