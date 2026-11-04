import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useTurnIntoBlockOptions } from '@/advanced-text-editor/hooks/useTurnIntoBlockOptions';
import { Dropdown } from 'twenty-ui/components/navigation';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { type Editor } from '@tiptap/react';
import { useId } from 'react';
import { LightButton } from 'twenty-ui/components/input';
import { IconTextSize } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

type TurnIntoBlockDropdownProps = {
  editor: Editor;
};

export const TurnIntoBlockDropdown = ({
  editor,
}: TurnIntoBlockDropdownProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const instanceId = useId();
  const dropdownId = `turn-into-block-dropdown-${instanceId}`;

  const options = useTurnIntoBlockOptions(editor);
  const activeItem = options.find((option) => option.isActive());
  const { icon: ActiveIcon = IconTextSize, title: activeTitle = t`Text` } =
    activeItem ?? {};

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger
        render={
          <LightButton size="sm" startIcon={<ActiveIcon />}>
            {activeTitle}
          </LightButton>
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
