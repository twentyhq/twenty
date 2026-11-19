import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { PageLayoutSettingsVisibilityItem } from '@/side-panel/pages/page-layout/components/PageLayoutSettingsVisibilityItem';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type DashboardWidgetSettingsManageSectionProps = {
  pageLayoutId: string;
};

export const DashboardWidgetSettingsManageSection = ({
  pageLayoutId,
}: DashboardWidgetSettingsManageSectionProps) => {
  const { t } = useLingui();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  return (
    <SidePanelGroup heading={t`Manage`}>
      <PageLayoutSettingsVisibilityItem
        widget={widgetInEditMode}
        selectableItemId={
          WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION
        }
      />
    </SidePanelGroup>
  );
};
