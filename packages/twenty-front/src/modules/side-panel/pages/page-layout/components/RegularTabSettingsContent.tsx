import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import {
  AppTooltip,
  IconChevronLeft,
  IconChevronRight,
  IconCopyPlus,
  IconPinned,
  IconRefreshDot,
  IconTrash,
} from 'twenty-ui/display';

const RESET_TAB_TO_DEFAULT_MODAL_ID = 'reset-regular-tab-to-default-modal';
const RESET_TAB_TO_DEFAULT_MENU_ITEM_ID =
  'reset-regular-tab-to-default-menu-item';

type RegularTabSettingsContentProps = {
  canSetAsPinned: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  isResetToDefaultDisabled: boolean;
  canDelete: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSetAsPinned: () => void;
  onDuplicate: () => void;
  onResetToDefault: () => void;
  onDelete: () => void;
};

export const RegularTabSettingsContent = ({
  canSetAsPinned,
  canMoveLeft,
  canMoveRight,
  isResetToDefaultDisabled,
  canDelete,
  onMoveLeft,
  onMoveRight,
  onSetAsPinned,
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

  const selectableItemIds = [
    ...(canMoveLeft ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT] : []),
    ...(canMoveRight ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT] : []),
    ...(canSetAsPinned ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED] : []),
    TAB_SETTINGS_SELECTABLE_ITEM_IDS.DUPLICATE,
    TAB_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT,
    ...(canDelete ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE] : []),
  ];

  return (
    <>
      <SidePanelList selectableItemIds={selectableItemIds}>
        <SidePanelGroup heading={t`Settings`}>
          {canMoveLeft && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT}
              onEnter={onMoveLeft}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT}
                Icon={IconChevronLeft}
                label={t`Move left`}
                onClick={onMoveLeft}
              />
            </SelectableListItem>
          )}
          {canMoveRight && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT}
              onEnter={onMoveRight}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT}
                Icon={IconChevronRight}
                label={t`Move right`}
                onClick={onMoveRight}
              />
            </SelectableListItem>
          )}
          {canSetAsPinned && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED}
              onEnter={onSetAsPinned}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED}
                Icon={IconPinned}
                label={t`Set as pinned tab`}
                onClick={onSetAsPinned}
              />
            </SelectableListItem>
          )}
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
