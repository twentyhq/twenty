import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { SettingsStatsGrid } from '@/settings/components/SettingsStatsGrid';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewSummariesSelector } from '@/views/states/selectors/viewSummariesSelector';
import { useLingui } from '@lingui/react/macro';
import {
  IconCommand,
  IconCompass,
  IconLayoutGridAdd,
  IconPerspective,
  IconTable,
} from 'twenty-ui/icon';

export const SettingsLayoutItemsStats = () => {
  const { t } = useLingui();

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const viewSummaries = useAtomStateValue(viewSummariesSelector);
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
            Icon: IconCompass,
            label: t`Sidebar items`,
            value: navigationMenuItems.length.toString(),
          },
        ],
        [
          {
            Icon: IconTable,
            label: t`Views`,
            value: viewSummaries.length.toString(),
          },
          {
            Icon: IconPerspective,
            label: t`Pages`,
            value: pageLayoutsWithRelations.length.toString(),
          },
        ],
        [
          {
            Icon: IconLayoutGridAdd,
            label: t`Widgets`,
            value: frontComponents.length.toString(),
          },
        ],
      ]}
    />
  );
};
