import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { CanvasTabWidgetVisibilityDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/CanvasTabWidgetVisibilityDropdownContent';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { useTranslatedVisibilityLabel } from '@/side-panel/pages/page-layout/hooks/useTranslatedVisibilityLabel';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconChevronRight,
  IconEyeX,
  IconPinned,
  IconRefreshDot,
  IconTrash,
} from 'twenty-ui/display';

const RESET_TAB_TO_DEFAULT_MODAL_ID = 'reset-canvas-tab-to-default-modal';

type CanvasTabSettingsContentProps = {
  pageLayoutId: string;
  canvasWidget: PageLayoutWidget | undefined;
  canSetAsPinned: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  canShowResetToDefault: boolean;
  canDelete: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSetAsPinned: () => void;
  onResetToDefault: () => void;
  onDelete: () => void;
};

export const CanvasTabSettingsContent = ({
  pageLayoutId,
  canvasWidget,
  canSetAsPinned,
  canMoveLeft,
  canMoveRight,
  canShowResetToDefault,
  canDelete,
  onMoveLeft,
  onMoveRight,
  onSetAsPinned,
  onResetToDefault,
  onDelete,
}: CanvasTabSettingsContentProps) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const visibilityLabel = useTranslatedVisibilityLabel(
    canvasWidget?.conditionalAvailabilityExpression,
  );

  const handleResetToDefault = () => {
    openModal(RESET_TAB_TO_DEFAULT_MODAL_ID);
  };

  const selectableItemIds = [
    ...(canSetAsPinned ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED] : []),
    ...(canMoveLeft ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT] : []),
    ...(canMoveRight ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT] : []),
    ...(isDefined(canvasWidget)
      ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION]
      : []),
    ...(canShowResetToDefault
      ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT]
      : []),
    ...(canDelete ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE] : []),
  ];

  return (
    <>
      <SidePanelList selectableItemIds={selectableItemIds}>
        <SidePanelGroup heading={t`Placement`}>
          {canSetAsPinned && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED}
              onEnter={onSetAsPinned}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED}
                Icon={IconPinned}
                label={t`Pin tab`}
                onClick={onSetAsPinned}
              />
            </SelectableListItem>
          )}
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
        </SidePanelGroup>
        <SidePanelGroup heading={t`Manage`}>
          {isDefined(canvasWidget) && (
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
                    <CanvasTabWidgetVisibilityDropdownContent
                      widgetId={canvasWidget.id}
                      currentExpression={
                        canvasWidget.conditionalAvailabilityExpression
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
          )}
          {canShowResetToDefault && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT}
              onEnter={handleResetToDefault}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT}
                Icon={IconRefreshDot}
                label={t`Reset to default`}
                onClick={handleResetToDefault}
              />
            </SelectableListItem>
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
