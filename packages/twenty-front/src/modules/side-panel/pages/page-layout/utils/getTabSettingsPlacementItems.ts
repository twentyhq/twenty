import { type CommandMenuItemProps } from '@/command-menu/components/CommandMenuItem';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPinned,
  IconPinnedOff,
} from 'twenty-ui/icon';

type GetTabSettingsPlacementItemsParams = {
  canSetAsPinned: boolean;
  canUnpin: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onSetAsPinned: () => void;
  onUnpin: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
};

export const getTabSettingsPlacementItems = ({
  canSetAsPinned,
  canUnpin,
  canMoveLeft,
  canMoveRight,
  onSetAsPinned,
  onUnpin,
  onMoveLeft,
  onMoveRight,
}: GetTabSettingsPlacementItemsParams): CommandMenuItemProps[] =>
  [
    canSetAsPinned
      ? {
          id: TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED,
          label: t`Pin tab`,
          Icon: IconPinned,
          onClick: onSetAsPinned,
        }
      : undefined,
    canUnpin
      ? {
          id: TAB_SETTINGS_SELECTABLE_ITEM_IDS.UNPIN,
          label: t`Unpin tab`,
          Icon: IconPinnedOff,
          onClick: onUnpin,
        }
      : undefined,
    canMoveLeft
      ? {
          id: TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT,
          label: t`Move left`,
          Icon: IconChevronLeft,
          onClick: onMoveLeft,
        }
      : undefined,
    canMoveRight
      ? {
          id: TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT,
          label: t`Move right`,
          Icon: IconChevronRight,
          onClick: onMoveRight,
        }
      : undefined,
  ].filter(isDefined);
