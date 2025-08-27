import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useTheme } from '@emotion/react';
import { type Placement } from '@floating-ui/react';
import {
  type FunctionComponent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  IconChevronRight,
  type IconComponent,
  IconDotsVertical,
} from 'twenty-ui/display';
import { LightIconButton, type LightIconButtonProps } from 'twenty-ui/input';
import {
  type MenuItemAccent,
  MenuItemLeftContent,
  StyledHoverableMenuItemBase,
  StyledMenuItemLeftContent,
} from 'twenty-ui/navigation';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  onClick?: (event: MouseEvent<any>) => void;
};

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
}: MenuItemWithOptionDropdownProps) => {
  const theme = useTheme();

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
    >
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent LeftIcon={LeftIcon ?? undefined} text={text} />
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
        <Dropdown
          clickableComponent={
            <LightIconButton
              Icon={RightIcon ?? IconDotsVertical}
              size="small"
              accent="tertiary"
            />
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
