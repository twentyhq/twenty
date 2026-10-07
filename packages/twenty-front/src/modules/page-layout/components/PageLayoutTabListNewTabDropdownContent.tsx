import { Dropdown } from 'twenty-ui/components/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useUpdatePageLayoutTab } from '@/page-layout/hooks/useUpdatePageLayoutTab';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { isReactivatableTab } from '@/page-layout/utils/isReactivatableTab';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconPlus, useIcons } from 'twenty-ui/icon';

type PageLayoutTabListNewTabDropdownContentProps = {
  onCreate: () => void;
};

export const PageLayoutTabListNewTabDropdownContent = ({
  onCreate,
}: PageLayoutTabListNewTabDropdownContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const { updatePageLayoutTab } = useUpdatePageLayoutTab();

  const setActiveTabId = useSetAtomComponentState(activeTabIdComponentState);
  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const inactiveTabs = sortTabsByPosition(
    currentPageLayout.tabs.filter(isReactivatableTab),
  );

  const handleReactivateTab = useCallback(
    (tabId: string) => {
      updatePageLayoutTab(tabId, { isActive: true });
      setActiveTabId(tabId);
      navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.PageLayoutTabSettings,
        resetNavigationStack: true,
      });
      setPageLayoutTabSettingsOpenTabId(tabId);
    },
    [
      updatePageLayoutTab,
      setActiveTabId,
      setPageLayoutTabSettingsOpenTabId,
      navigatePageLayoutSidePanel,
    ],
  );

  return (
    <>
      <Dropdown.Header>
        <Dropdown.Title>{t`New tab`}</Dropdown.Title>
      </Dropdown.Header>
      <Dropdown.Section>
        <Dropdown.ActionItem
          startIcon={<IconPlus />}
          onClick={onCreate}
        >{t`Empty tab`}</Dropdown.ActionItem>
      </Dropdown.Section>
      {isNonEmptyArray(inactiveTabs) && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section label={t`Disabled`}>
            {inactiveTabs.map((tab) => (
              <Dropdown.ActionItem
                key={tab.id}
                startIcon={
                  <SelectOptionIcon
                    Icon={isDefined(tab.icon) ? getIcon(tab.icon) : undefined}
                  />
                }
                onClick={() => handleReactivateTab(tab.id)}
              >
                {tab.title}
              </Dropdown.ActionItem>
            ))}
          </Dropdown.Section>
        </>
      )}
    </>
  );
};
