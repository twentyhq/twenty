import { useTurnIntoBlockOptions } from '@/advanced-text-editor/hooks/useTurnIntoBlockOptions';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/react';
import { useId } from 'react';
import { IconPilcrow } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

const StyledMenuItem = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: 4px;
  height: ${({ theme }) => theme.spacing(6)};
  padding: 0;
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.spacing(1.5)};

  :hover {
    background: ${({ theme }) => theme.background.transparent.medium};
  }

  :focus {
    outline: none;
  }
`;

type TurnIntoBlockDropdownProps = {
  editor: Editor;
};

export const TurnIntoBlockDropdown = ({
  editor,
}: TurnIntoBlockDropdownProps) => {
  const theme = useTheme();

  const instanceId = useId();
  const dropdownId = `turn-into-block-dropdown-${instanceId}`;
  const { toggleDropdown } = useToggleDropdown();

  const options = useTurnIntoBlockOptions(editor);
  const activeItem = options.find((option) => option.isActive());
  const { icon: ActiveIcon = IconPilcrow, title: activeTitle = t`Paragraph` } =
    activeItem ?? {};

  return (
    <Dropdown
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {options.map(({ id, title, icon, onClick }) => (
              <MenuItem
                key={id}
                text={title}
                LeftIcon={icon}
                onClick={() => {
                  onClick();
                  toggleDropdown({
                    dropdownComponentInstanceIdFromProps: dropdownId,
                  });
                }}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownId={dropdownId}
      clickableComponent={
        <StyledMenuItem>
          <ActiveIcon size={theme.icon.size.md} />
          {activeTitle}
        </StyledMenuItem>
      }
      dropdownOffset={{
        y: parseInt(theme.spacing(1), 10),
      }}
    />
  );
};
