import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useResetPageLayoutWidgetToDefault } from '@/page-layout/hooks/useResetPageLayoutWidgetToDefault';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { WidgetVisibilityDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/WidgetVisibilityDropdownContent';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useTranslatedVisibilityLabel } from '@/side-panel/pages/page-layout/hooks/useTranslatedVisibilityLabel';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  IconEyeX,
  IconRefreshDot,
  IconSwitchHorizontal,
  IconTrash,
} from 'twenty-ui/display';

const RESET_WIDGET_TO_DEFAULT_MODAL_ID = 'reset-widget-to-default-modal';
const RESET_WIDGET_TO_DEFAULT_MENU_ITEM_ID =
  'reset-widget-to-default-menu-item';

type WidgetSettingsManageSectionProps = {
  pageLayoutId: string;
};

export const WidgetSettingsManageSection = ({
  pageLayoutId,
}: WidgetSettingsManageSectionProps) => {
  const { t } = useLingui();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { deletePageLayoutWidget } = useDeletePageLayoutWidget(pageLayoutId);

  const { resetPageLayoutWidgetToDefault } =
    useResetPageLayoutWidgetToDefault(pageLayoutId);

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const { openModal } = useModal();

  const visibilityLabel = useTranslatedVisibilityLabel(
    widgetInEditMode?.conditionalAvailabilityExpression,
  );

  if (!isDefined(pageLayoutEditingWidgetId)) {
    return null;
  }

  const isResetToDefaultDisabled =
    !isNonEmptyString(widgetInEditMode?.applicationId) ||
    widgetInEditMode.applicationId ===
      currentWorkspace?.workspaceCustomApplication?.id;

  const handleResetToDefault = () => {
    if (isResetToDefaultDisabled) {
      return;
    }
    openModal(RESET_WIDGET_TO_DEFAULT_MODAL_ID);
  };

  const handleConfirmReset = () => {
    resetPageLayoutWidgetToDefault(pageLayoutEditingWidgetId);
  };

  const handleReplaceWidget = () => {
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    });
  };

  const handleDeleteWidget = () => {
    deletePageLayoutWidget(pageLayoutEditingWidgetId);
  };

  return (
    <>
      <SidePanelGroup heading={t`Manage`}>
        <SelectableListItem
          itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION}
        >
          <CommandMenuItemDropdown
            id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION}
            label={t`Visibility Restriction`}
            Icon={IconEyeX}
            dropdownId={
              WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION
            }
            dropdownComponents={
              <DropdownContent>
                <WidgetVisibilityDropdownContent />
              </DropdownContent>
            }
            dropdownPlacement="bottom-end"
            description={visibilityLabel}
            contextualTextPosition="right"
          />
        </SelectableListItem>
        <div id={RESET_WIDGET_TO_DEFAULT_MENU_ITEM_ID}>
          <SelectableListItem
            itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT}
            onEnter={handleResetToDefault}
          >
            <CommandMenuItem
              id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT}
              Icon={IconRefreshDot}
              label={t`Reset to default`}
              onClick={handleResetToDefault}
              disabled={isResetToDefaultDisabled}
            />
          </SelectableListItem>
        </div>
        {isResetToDefaultDisabled && (
          <AppTooltip
            anchorSelect={`#${RESET_WIDGET_TO_DEFAULT_MENU_ITEM_ID}`}
            content={t`No default configuration available for this widget`}
            noArrow
            place="bottom"
          />
        )}
        <SelectableListItem
          itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.REPLACE_WIDGET}
          onEnter={handleReplaceWidget}
        >
          <CommandMenuItem
            id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.REPLACE_WIDGET}
            Icon={IconSwitchHorizontal}
            label={t`Replace widget`}
            hasSubMenu
            onClick={handleReplaceWidget}
          />
        </SelectableListItem>
        <SelectableListItem
          itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.DELETE_WIDGET}
          onEnter={handleDeleteWidget}
        >
          <CommandMenuItem
            id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.DELETE_WIDGET}
            Icon={IconTrash}
            label={t`Delete widget`}
            onClick={handleDeleteWidget}
          />
        </SelectableListItem>
      </SidePanelGroup>
      <ConfirmationModal
        modalInstanceId={RESET_WIDGET_TO_DEFAULT_MODAL_ID}
        title={t`Reset to default`}
        subtitle={t`This will cancel all modifications done on the widget. This action cannot be undone.`}
        onConfirmClick={handleConfirmReset}
        confirmButtonText={t`Reset`}
        confirmButtonAccent="danger"
      />
    </>
  );
};
