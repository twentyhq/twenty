import {
  CommandMenuItem,
  type CommandMenuItemProps,
} from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';

type TabSettingsPlacementSectionProps = {
  items: CommandMenuItemProps[];
};

export const TabSettingsPlacementSection = ({
  items,
}: TabSettingsPlacementSectionProps) => {
  const { t } = useLingui();

  if (items.length === 0) {
    return null;
  }

  return (
    <SidePanelGroup heading={t`Placement`}>
      {items.map((item) => (
        <SelectableListItem
          key={item.id}
          itemId={item.id}
          onEnter={item.onClick}
        >
          <CommandMenuItem
            id={item.id}
            label={item.label}
            Icon={item.Icon}
            onClick={item.onClick}
          />
        </SelectableListItem>
      ))}
    </SidePanelGroup>
  );
};
