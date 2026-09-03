import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { TabSettingsPlacementSection } from '@/side-panel/pages/page-layout/components/TabSettingsPlacementSection';
import { SingleWidgetTabVisibilityDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/SingleWidgetTabVisibilityDropdownContent';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { useTranslatedVisibilityLabel } from '@/side-panel/pages/page-layout/hooks/useTranslatedVisibilityLabel';
import { getTabSettingsPlacementItems } from '@/side-panel/pages/page-layout/utils/getTabSettingsPlacementItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { IconEyeX, IconRefreshDot, IconTrash } from 'twenty-ui/icon';
import { AppTooltip } from 'twenty-ui/surfaces';

const RESET_TAB_TO_DEFAULT_MODAL_ID =
  'reset-single-widget-tab-to-default-modal';
const RESET_TAB_TO_DEFAULT_MENU_ITEM_ID =
  'reset-single-widget-tab-to-default-menu-item';

type SingleWidgetTabSettingsContentProps = {
  pageLayoutId: string;
  singleWidget: PageLayoutWidget;
  canSetAsPinned: boolean;
  canUnpin: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  isResetToDefaultDisabled: boolean;
  canDelete: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSetAsPinned: () => void;
  onUnpin: () => void;
  onResetToDefault: () => void;
  onDelete: () => void;
};

export const SingleWidgetTabSettingsContent = ({
  pageLayoutId,
  singleWidget,
  canSetAsPinned,
  canUnpin,
  canMoveLeft,
  canMoveRight,
  isResetToDefaultDisabled,
  canDelete,
  onMoveLeft,
  onMoveRight,
  onSetAsPinned,
  onUnpin,
  onResetToDefault,
  onDelete,
}: SingleWidgetTabSettingsContentProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const visibilityLabel = useTranslatedVisibilityLabel(
    singleWidget.conditionalAvailabilityExpression,
  );

  const handleResetToDefault = () => {
    if (isResetToDefaultDisabled) {
      return;
    }
    openModal(RESET_TAB_TO_DEFAULT_MODAL_ID);
  };

  const placementItems = getTabSettingsPlacementItems({
    canSetAsPinned,
    canUnpin,
    canMoveLeft,
    canMoveRight,
    onSetAsPinned,
    onUnpin,
    onMoveLeft,
    onMoveRight,
  });

  const selectableItemIds = [
    ...placementItems.map((item) => item.id),
    TAB_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION,
    TAB_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT,
    ...(canDelete ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE] : []),
  ];

  return (
    <>
      <SidePanelList selectableItemIds={selectableItemIds}>
        <TabSettingsPlacementSection items={placementItems} />
        <SidePanelGroup heading={t`Manage`}>
          <SelectableListItem
            itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION}
          >
            <CommandMenuItemDropdown
              id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION}
              label={t`Visibility restriction`}
              Icon={IconEyeX}
              dropdownId={
                TAB_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION
              }
              dropdownComponents={
                <DropdownContent>
                  <SingleWidgetTabVisibilityDropdownContent
                    widgetId={singleWidget.id}
                    currentExpression={
                      singleWidget.conditionalAvailabilityExpression
                    }
                    pageLayoutId={pageLayoutId}
                  />
                </DropdownContent>
              }
              dropdownPlacement="bottom-end"
              description={visibilityLabel}
              contextualTextPosition="right"
            />
          </SelectableListItem>
          <div id={RESET_TAB_TO_DEFAULT_MENU_ITEM_ID}>
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT}
              onEnter={handleResetToDefault}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT}
                Icon={IconRefreshDot}
                label={t`Reset to default`}
                onClick={handleResetToDefault}
                disabled={isResetToDefaultDisabled}
              />
            </SelectableListItem>
          </div>
          {isResetToDefaultDisabled && (
            <AppTooltip
              anchorSelect={`#${RESET_TAB_TO_DEFAULT_MENU_ITEM_ID}`}
              content={t`No default configuration available for this tab`}
              noArrow
              place="bottom"
            />
          )}
          {canDelete && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE}
              onEnter={onDelete}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE}
                Icon={IconTrash}
                label={t`Delete`}
                onClick={onDelete}
              />
            </SelectableListItem>
          )}
        </SidePanelGroup>
      </SidePanelList>
      <ConfirmationModal
        modalInstanceId={RESET_TAB_TO_DEFAULT_MODAL_ID}
        title={t`Reset to default`}
        subtitle={t`This will cancel all modifications done on the tab and its widgets. Edit mode will be canceled and the page will refresh. This action cannot be undone.`}
        onConfirmClick={onResetToDefault}
        confirmButtonText={t`Reset`}
        confirmButtonAccent="danger"
      />
    </>
  );
};
