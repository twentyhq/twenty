import styled from '@emotion/styled';
import {
  IconBookmark,
  IconComponent,
  IconDotsVertical,
  IconTrash,
} from 'twenty-ui';

import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type LinksFieldMenuItemProps = {
  dropdownId: string;
  isPrimary?: boolean;
  label: string;
  onDelete: () => void;
  url: string;
};

const StyledIconBookmark = styled(IconBookmark)`
  color: ${({ theme }) => theme.font.color.light};
  height: ${({ theme }) => theme.icon.size.sm}px;
  width: ${({ theme }) => theme.icon.size.sm}px;
`;

export const LinksFieldMenuItem = ({
  dropdownId,
  isPrimary,
  label,
  onDelete,
  url,
}: LinksFieldMenuItemProps) => {
  const { isDropdownOpen } = useDropdown(dropdownId);

  return (
    <MenuItem
      text={<LinkDisplay value={{ label, url }} />}
      isIconDisplayedOnHoverOnly={!isPrimary && !isDropdownOpen}
      iconButtons={[
        {
          Wrapper: isPrimary
            ? undefined
            : ({ iconButton }) => (
                <Dropdown
                  dropdownId={dropdownId}
                  dropdownHotkeyScope={{
                    scope: dropdownId,
                  }}
                  dropdownPlacement="right-start"
                  dropdownStrategy="fixed"
                  disableBlur
                  clickableComponent={iconButton}
                  dropdownComponents={
                    <DropdownMenuItemsContainer>
                      <MenuItem
                        accent="danger"
                        LeftIcon={IconTrash}
                        text="Delete"
                        onClick={onDelete}
                      />
                    </DropdownMenuItemsContainer>
                  }
                />
              ),
          Icon: isPrimary
            ? (StyledIconBookmark as IconComponent)
            : IconDotsVertical,
          accent: 'tertiary',
          onClick: isPrimary ? undefined : () => {},
        },
      ]}
    />
  );
};
