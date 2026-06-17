import { useTurnIntoBlockOptions } from '@/advanced-text-editor/hooks/useTurnIntoBlockOptions';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/react';
import { useContext, useId } from 'react';
import { IconPilcrow } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledMenuItem = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.spacing[1.5]};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: 4px;
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[1.5]};
  padding: 0;
  width: 100%;

  :hover {
    background: ${themeCssVariables.background.transparent.medium};
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
  const { theme } = useContext(ThemeContext);
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
        y: parseInt(theme.spacing[1], 10),
      }}
    />
  );
};
