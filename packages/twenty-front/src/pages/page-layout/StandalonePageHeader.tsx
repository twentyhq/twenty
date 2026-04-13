import { StandalonePageCommandMenu } from '@/command-menu-item/components/StandalonePageCommandMenu';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

type StandalonePageHeaderProps = {
  pageLayoutId: string;
};

export const StandalonePageHeader = ({
  pageLayoutId,
}: StandalonePageHeaderProps) => {
  const { getIcon } = useIcons();
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const navigationMenuItem = navigationMenuItems.find(
    (item) => item.pageLayoutId === pageLayoutId,
  );

  const title = navigationMenuItem?.name ?? '';
  const Icon = isDefined(navigationMenuItem?.icon)
    ? getIcon(navigationMenuItem.icon)
    : undefined;

  return (
    <PageHeader title={title} Icon={Icon}>
      <StandalonePageCommandMenu />
      {!isLayoutCustomizationModeEnabled && <SidePanelToggleButton />}
    </PageHeader>
  );
};
