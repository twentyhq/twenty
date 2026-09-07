import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { TabSettingsPlacementSection } from '@/side-panel/pages/page-layout/components/TabSettingsPlacementSection';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { getTabSettingsPlacementItems } from '@/side-panel/pages/page-layout/utils/getTabSettingsPlacementItems';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { IconCopyPlus, IconRefreshDot, IconTrash } from 'twenty-ui/icon';
import { AppTooltip } from 'twenty-ui/surfaces';

const RESET_TAB_TO_DEFAULT_MODAL_ID = 'reset-regular-tab-to-default-modal';
const RESET_TAB_TO_DEFAULT_MENU_ITEM_ID =
  'reset-regular-tab-to-default-menu-item';

type RegularTabSettingsContentProps = {
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
  onDuplicate: () => void;
  onResetToDefault: () => void;
  onDelete: () => void;
};

export const RegularTabSettingsContent = ({
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
  onDuplicate,
  onResetToDefault,
  onDelete,
}: RegularTabSettingsContentProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();

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
    TAB_SETTINGS_SELECTABLE_ITEM_IDS.DUPLICATE,
    TAB_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT,
    ...(canDelete ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE] : []),
  ];

  return (
    <>
      <SidePanelList selectableItemIds={selectableItemIds}>
        <TabSettingsPlacementSection items={placementItems} />
        <SidePanelGroup heading={t`Manage`}>
          <SelectableListItem
            itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DUPLICATE}
            onEnter={onDuplicate}
          >
            <CommandMenuItem
              id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DUPLICATE}
              Icon={IconCopyPlus}
              label={t`Duplicate`}
              onClick={onDuplicate}
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
