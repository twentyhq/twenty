import { Dropdown } from 'twenty-ui/components/navigation';
import { useMoveWidgetToTab } from '@/page-layout/hooks/useMoveWidgetToTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { canVerticalListAcceptWidget } from '@/page-layout/utils/canVerticalListAcceptWidget';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const MoveToTabDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { moveWidgetToTab } = useMoveWidgetToTab(pageLayoutId);

  const currentTab = isDefined(pageLayoutEditingWidgetId)
    ? pageLayoutDraft.tabs.find((tab) =>
        tab.widgets.some((widget) => widget.id === pageLayoutEditingWidgetId),
      )
    : undefined;

  const currentWidget = currentTab?.widgets.find(
    (widget) => widget.id === pageLayoutEditingWidgetId,
  );

  const eligibleTabs = pageLayoutDraft.tabs.filter(
    (tab) =>
      tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
      tab.id !== currentTab?.id &&
      isDefined(currentWidget) &&
      canVerticalListAcceptWidget({
        destinationWidgets: tab.widgets,
        widget: currentWidget,
      }),
  );

  if (!isDefined(pageLayoutEditingWidgetId)) {
    return null;
  }

  if (!isNonEmptyArray(eligibleTabs)) {
    return (
      <Dropdown.Section>
        <Dropdown.ActionItem
          disabled
        >{t`No available tabs`}</Dropdown.ActionItem>
      </Dropdown.Section>
    );
  }

  return (
    <Dropdown.Section scrollable>
      {eligibleTabs.map((tab) => (
        <Dropdown.ActionItem
          key={tab.id}
          onClick={() => {
            moveWidgetToTab(pageLayoutEditingWidgetId, tab.id);
          }}
        >
          {tab.title ?? ''}
        </Dropdown.ActionItem>
      ))}
    </Dropdown.Section>
  );
};
