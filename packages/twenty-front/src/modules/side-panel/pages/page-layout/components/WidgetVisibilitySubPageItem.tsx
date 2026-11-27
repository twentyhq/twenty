import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconEye, IconEyeX } from 'twenty-ui/icon';

type WidgetVisibilitySubPageItemProps = {
  pageLayoutId: string;
};

export const WidgetVisibilitySubPageItem = ({
  pageLayoutId,
}: WidgetVisibilitySubPageItemProps) => {
  const { t } = useLingui();
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const hasConditionalAvailability = isDefined(
    widgetInEditMode?.conditionalAvailability,
  );

  const handleClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutWidgetVisibility);
  };

  return (
    <SelectableListItem
      itemId={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION}
      onEnter={handleClick}
    >
      <CommandMenuItem
        id={WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION}
        label={t`Visibility`}
        Icon={hasConditionalAvailability ? IconEyeX : IconEye}
        hasSubMenu
        onClick={handleClick}
        description={
          hasConditionalAvailability ? t`Custom rule` : t`Everyone`
        }
        contextualTextPosition="right"
      />
    </SelectableListItem>
  );
};
