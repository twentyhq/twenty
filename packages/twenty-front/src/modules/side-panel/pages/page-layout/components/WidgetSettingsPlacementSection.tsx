import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useCanMovePageLayoutWidgetDown } from '@/page-layout/hooks/useCanMovePageLayoutWidgetDown';
import { useCanMovePageLayoutWidgetUp } from '@/page-layout/hooks/useCanMovePageLayoutWidgetUp';
import { useMovePageLayoutWidgetDown } from '@/page-layout/hooks/useMovePageLayoutWidgetDown';
import { useMovePageLayoutWidgetUp } from '@/page-layout/hooks/useMovePageLayoutWidgetUp';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { MoveToTabDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/MoveToTabDropdownContent';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowsVertical,
  IconChevronDown,
  IconChevronUp,
  IconRowInsertBottom,
  IconRowInsertTop,
} from 'twenty-ui/display';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type WidgetSettingsPlacementSectionProps = {
  pageLayoutId: string;
};

export const WidgetSettingsPlacementSection = ({
  pageLayoutId,
}: WidgetSettingsPlacementSectionProps) => {
  const { t } = useLingui();

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const widgetInsertionContextState = useAtomComponentStateCallbackState(
    widgetInsertionContextComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const { movePageLayoutWidgetUp } = useMovePageLayoutWidgetUp(pageLayoutId);
  const { movePageLayoutWidgetDown } =
    useMovePageLayoutWidgetDown(pageLayoutId);
  const { canMovePageLayoutWidgetUp } =
    useCanMovePageLayoutWidgetUp(pageLayoutId);
  const { canMovePageLayoutWidgetDown } =
    useCanMovePageLayoutWidgetDown(pageLayoutId);

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  if (!isDefined(pageLayoutEditingWidgetId)) {
    return null;
  }

  const currentTab = pageLayoutDraft.tabs.find((tab) =>
    tab.widgets.some((widget) => widget.id === pageLayoutEditingWidgetId),
  );

  if (
    !isDefined(currentTab) ||
    currentTab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST
  ) {
    return null;
  }

  const showMoveUp = canMovePageLayoutWidgetUp(pageLayoutEditingWidgetId);
  const showMoveDown = canMovePageLayoutWidgetDown(pageLayoutEditingWidgetId);

  const handleMoveUp = () => {
    movePageLayoutWidgetUp(pageLayoutEditingWidgetId);
  };

  const handleMoveDown = () => {
    movePageLayoutWidgetDown(pageLayoutEditingWidgetId);
  };

  const handleAddWidgetAbove = () => {
    store.set(widgetInsertionContextState, {
      targetWidgetId: pageLayoutEditingWidgetId,
      direction: 'above',
    });

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    });
  };

  const handleAddWidgetBelow = () => {
    store.set(widgetInsertionContextState, {
      targetWidgetId: pageLayoutEditingWidgetId,
      direction: 'below',
    });

    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    });
  };

  return (
    <SidePanelGroup heading={t`Placement`}>
      {showMoveUp && (
        <SelectableListItem
          itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_UP}
          onEnter={handleMoveUp}
        >
          <CommandMenuItem
            id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_UP}
            Icon={IconChevronUp}
            label={t`Move Up`}
            onClick={handleMoveUp}
          />
        </SelectableListItem>
      )}
      {showMoveDown && (
        <SelectableListItem
          itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_DOWN}
          onEnter={handleMoveDown}
        >
          <CommandMenuItem
            id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_DOWN}
            Icon={IconChevronDown}
            label={t`Move Down`}
            onClick={handleMoveDown}
          />
        </SelectableListItem>
      )}
      <SelectableListItem
        itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB}
      >
        <CommandMenuItemDropdown
          id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB}
          label={t`Move to another tab`}
          Icon={IconArrowsVertical}
          dropdownId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB}
          dropdownComponents={
            <DropdownContent>
              <MoveToTabDropdownContent />
            </DropdownContent>
          }
          dropdownPlacement="bottom-end"
        />
      </SelectableListItem>
      <SelectableListItem
        itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_ABOVE}
        onEnter={handleAddWidgetAbove}
      >
        <CommandMenuItem
          id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_ABOVE}
          Icon={IconRowInsertTop}
          label={t`Add widget above`}
          onClick={handleAddWidgetAbove}
        />
      </SelectableListItem>
      <SelectableListItem
        itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_BELOW}
        onEnter={handleAddWidgetBelow}
      >
        <CommandMenuItem
          id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_BELOW}
          Icon={IconRowInsertBottom}
          label={t`Add widget below`}
          onClick={handleAddWidgetBelow}
        />
      </SelectableListItem>
    </SidePanelGroup>
  );
};
