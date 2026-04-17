import { useMoveWidgetToTab } from '@/page-layout/hooks/useMoveWidgetToTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const MoveToTabDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { moveWidgetToTab } = useMoveWidgetToTab(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const currentTab = isDefined(pageLayoutEditingWidgetId)
    ? pageLayoutDraft.tabs.find((tab) =>
        tab.widgets.some((widget) => widget.id === pageLayoutEditingWidgetId),
      )
    : undefined;

  const eligibleTabs = pageLayoutDraft.tabs.filter(
    (tab) =>
      tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
      tab.id !== currentTab?.id,
  );

  if (!isDefined(pageLayoutEditingWidgetId)) {
    return null;
  }

  if (eligibleTabs.length === 0) {
    return (
      <DropdownMenuItemsContainer>
        <MenuItem text={t`No available tabs`} />
      </DropdownMenuItemsContainer>
    );
  }

  return (
    <DropdownMenuItemsContainer>
      {eligibleTabs.map((tab) => (
        <MenuItem
          key={tab.id}
          text={tab.title ?? ''}
          onClick={() => {
            moveWidgetToTab(pageLayoutEditingWidgetId, tab.id);
            closeDropdown();
          }}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
