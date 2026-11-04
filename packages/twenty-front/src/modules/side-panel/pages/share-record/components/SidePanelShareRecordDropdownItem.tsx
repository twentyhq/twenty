import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  Dropdown,
  type DropdownType,
  ListItemButton,
} from 'twenty-ui/components/navigation';
import { IconChevronRight, type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { RECORD_SHARING_ACCESS_MENU_SIDE_OFFSET_IN_PX } from '@/object-record/record-sharing/constants/RecordSharingAccessMenuSideOffsetInPx';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';

type SidePanelShareRecordDropdownItemProps = {
  label: string;
  Icon: IconComponent;
  LeftComponent?: ReactNode;
  description?: string;
  disabled?: boolean;
  type?: DropdownType;
  width?: number;
  children: ReactNode;
};

export const SidePanelShareRecordDropdownItem = ({
  label,
  Icon,
  LeftComponent,
  description,
  disabled = false,
  type = 'menu',
  width = GenericDropdownContentWidth.Narrow,
  children,
}: SidePanelShareRecordDropdownItemProps) => {
  const theme = useTheme();
  const dropdownId = useId();

  return (
    <DropdownRoot dropdownId={dropdownId} type={type}>
      <Dropdown.Trigger
        render={
          <ListItemButton
            startIcon={
              LeftComponent ?? (
                <ListItemIconContainer>
                  <Icon
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                </ListItemIconContainer>
              )
            }
            description={description}
            descriptionPlacement="end"
            endIcon={<IconChevronRight />}
            focusableWhenDisabled
          >
            {label}
          </ListItemButton>
        }
        disabled={disabled}
        aria-label={isDefined(description) ? `${label} ${description}` : label}
      />
      <DropdownContent
        align="end"
        sideOffset={RECORD_SHARING_ACCESS_MENU_SIDE_OFFSET_IN_PX}
        width={width}
        aria-label={label}
      >
        {children}
      </DropdownContent>
    </DropdownRoot>
  );
};
