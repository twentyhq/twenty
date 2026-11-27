import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/icon';

type CommandMenuSettingsSearchSectionProps = {
  results: SettingsSearchDestination[];
};

export const CommandMenuSettingsSearchSection = ({
  results,
}: CommandMenuSettingsSearchSectionProps) => {
  const { t } = useLingui();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { onItemClick } = useCommandMenuOnItemClick();

  return (
    <CommandMenuItemSectionGroup heading={t`Settings`} Icon={IconSettings}>
      {results.map((result) => (
        <SelectableListItem
          key={result.id}
          itemId={result.id}
          onEnter={() =>
            onItemClick({ onClick: closeSidePanelMenu, to: result.path })
          }
        >
          <CommandMenuItem
            id={result.id}
            label={result.title}
            description={result.breadcrumbs.join(' / ')}
            to={result.path}
            onClick={closeSidePanelMenu}
          />
        </SelectableListItem>
      ))}
    </CommandMenuItemSectionGroup>
  );
};
