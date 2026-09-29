import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useTurnIntoBlockOptions } from '@/advanced-text-editor/hooks/useTurnIntoBlockOptions';
import { Dropdown } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/react';
import { useId } from 'react';
import { IconPilcrow } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

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
  const theme = useTheme();
  const instanceId = useId();
  const dropdownId = `turn-into-block-dropdown-${instanceId}`;

  const options = useTurnIntoBlockOptions(editor);
  const activeItem = options.find((option) => option.isActive());
  const { icon: ActiveIcon = IconPilcrow, title: activeTitle = t`Paragraph` } =
    activeItem ?? {};

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger
        render={
          <StyledMenuItem>
            <ActiveIcon size={theme.icon.size.md} />
            {activeTitle}
          </StyledMenuItem>
        }
      />
      <DropdownContent
        align="end"
        sideOffset={parseInt(theme.spacing[1], 10)}
        finalFocus={() => editor.view.dom}
        aria-label={t`Turn into`}
      >
        <Dropdown.Section>
          {options.map(({ id, title, icon, onClick, isActive }) => (
            <Dropdown.OptionItem
              key={id}
              selected={isActive()}
              startIcon={<SelectOptionIcon Icon={icon} />}
              onSelect={onClick}
            >
              {title}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
