import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { SettingsStatsGrid } from '@/settings/components/SettingsStatsGrid';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useLingui } from '@lingui/react/macro';
import { IconAppWindow, IconCommand, IconLayoutSidebarLeftExpand, IconPuzzle, IconTable } from 'twenty-ui/icon';

export const SettingsLayoutItemsStats = () => {
  const { t } = useLingui();

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const pageLayoutsWithRelations = useAtomStateValue(
    pageLayoutsWithRelationsSelector,
  );
  const frontComponents = useAtomStateValue(frontComponentsSelector);

  return (
    <SettingsStatsGrid
      columns={[
        [
          {
            Icon: IconCommand,
            label: t`Commands`,
            value: commandMenuItems.length.toString(),
          },
          {
            Icon: IconLayoutSidebarLeftExpand,
            label: t`Sidebar items`,
            value: navigationMenuItems.length.toString(),
          },
        ],
        [
          {
            Icon: IconTable,
            label: t`Views`,
            value: views.length.toString(),
          },
          {
            Icon: IconAppWindow,
            label: t`Pages`,
            value: pageLayoutsWithRelations.length.toString(),
          },
        ],
        [
          {
            Icon: IconPuzzle,
            label: t`Widgets`,
            value: frontComponents.length.toString(),
          },
        ],
      ]}
    />
  );
};
