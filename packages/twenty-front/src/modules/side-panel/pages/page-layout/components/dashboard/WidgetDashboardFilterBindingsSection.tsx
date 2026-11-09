import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { DASHBOARD_FILTER_DEFAULT_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterDefaultOptionValue';
import { DASHBOARD_FILTER_IGNORED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterIgnoredOptionValue';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getDashboardFilterBindingsWithWidgetSetting } from '@/page-layout/utils/getDashboardFilterBindingsWithWidgetSetting';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';
import { getPageLayoutWidgetFilter } from '@/page-layout/utils/getPageLayoutWidgetFilter';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { getWidgetDashboardFilterSettings } from '@/page-layout/utils/getWidgetDashboardFilterSettings';
import { isPersistedPageLayoutWidgetReadOnly } from '@/page-layout/utils/isPersistedPageLayoutWidgetReadOnly';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { CHART_SETTINGS_DROPDOWN_SIDE_OFFSET } from '@/side-panel/pages/page-layout/constants/ChartSettingsDropdownSideOffset';
import { useDashboardFiltersForWidgetBindings } from '@/side-panel/pages/page-layout/hooks/useDashboardFiltersForWidgetBindings';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { getDashboardFilterBindingItemId } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingItemId';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsByIdMapSelector } from '@/views/states/selectors/viewsByIdMapSelector';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type WidgetDashboardFilterBindingsSectionProps = {
  widget: PageLayoutWidget;
};

export const WidgetDashboardFilterBindingsSection = ({
  widget,
}: WidgetDashboardFilterBindingsSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { openDropdown } = useOpenDropdown();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const viewsByIdMap = useAtomStateValue(viewsByIdMapSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { pageLayoutFilters } = useDashboardFiltersForWidgetBindings({
    pageLayoutId,
    objectMetadataId: widget.objectMetadataId,
  });
  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );
  const recordTableWidgetViewDraft = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const isReadOnly = isPersistedPageLayoutWidgetReadOnly({
    persistedWidget: pageLayoutPersisted?.tabs
      .flatMap((tab) => tab.widgets)
      .find(({ id }) => id === widget.id),
    currentWorkspace,
  });

  if (!isNonEmptyArray(pageLayoutFilters)) {
    return null;
  }

  const settings = getWidgetDashboardFilterSettings({
    pageLayoutFilters,
    configuration: widget.configuration,
    fields: isDefined(widget.objectMetadataId)
      ? (objectMetadataItemsByIdMap.get(widget.objectMetadataId)?.fields ?? [])
      : [],
    widgetFilter: getPageLayoutWidgetFilter({
      widget,
      viewsById: viewsByIdMap,
      recordTableWidgetViewDrafts: recordTableWidgetViewDraft,
    }),
  });

  const handleChange = ({
    pageLayoutFilterId,
    value,
  }: {
    pageLayoutFilterId: string;
    value: string;
  }) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        dashboardFilterBindings: getDashboardFilterBindingsWithWidgetSetting({
          dashboardFilterBindings: getWidgetDashboardFilterBindings(
            widget.configuration,
          ),
          pageLayoutFilterId,
          value,
        }),
      },
    });
  };

  return (
    <SidePanelGroup heading={t`Dashboard filters`}>
      {settings.map(({ pageLayoutFilter, value, options }) => {
        const itemId = getDashboardFilterBindingItemId(pageLayoutFilter.id);
        const label = getPageLayoutFilterDisplayLabel(pageLayoutFilter);

        return (
          <SelectableListItem
            key={pageLayoutFilter.id}
            itemId={itemId}
            onEnter={
              isReadOnly
                ? undefined
                : () =>
                    openDropdown({
                      dropdownComponentInstanceIdFromProps: itemId,
                    })
            }
          >
            <DropdownRoot dropdownId={itemId} type="picker">
              <Tooltip
                content={t`Set by the app that installed this widget`}
                delay={TooltipDelay.mediumDelay}
                disabled={!isReadOnly}
              >
                <div>
                  <CommandMenuItemDropdownTrigger
                    id={itemId}
                    Icon={IconCalendarEvent}
                    label={label}
                    description={
                      options.find((option) => option.value === value)?.label
                    }
                    contextualTextPosition="right"
                    disabled={isReadOnly}
                  />
                </div>
              </Tooltip>
              <DropdownContent
                side="bottom"
                align="end"
                sideOffset={CHART_SETTINGS_DROPDOWN_SIDE_OFFSET}
                collisionPadding={{ left: 0, right: 0 }}
              >
                <ChartSettingsDropdownSection>
                  <Dropdown.SelectionGroup
                    aria-label={label}
                    value={value}
                    onValueChange={(selectedValue) =>
                      isNonEmptyString(selectedValue) &&
                      handleChange({
                        pageLayoutFilterId: pageLayoutFilter.id,
                        value: selectedValue,
                      })
                    }
                  >
                    {options.map((option) => (
                      <Fragment key={option.value}>
                        {option.value ===
                          DASHBOARD_FILTER_IGNORED_OPTION_VALUE && (
                          <Dropdown.Separator />
                        )}
                        <Dropdown.OptionItem
                          value={option.value}
                          startIcon={
                            <SelectOptionIcon Icon={getIcon(option.iconName)} />
                          }
                        >
                          {option.label}
                        </Dropdown.OptionItem>
                        {option.value ===
                          DASHBOARD_FILTER_DEFAULT_OPTION_VALUE &&
                          options.length > 2 && <Dropdown.Separator />}
                      </Fragment>
                    ))}
                  </Dropdown.SelectionGroup>
                </ChartSettingsDropdownSection>
              </DropdownContent>
            </DropdownRoot>
          </SelectableListItem>
        );
      })}
    </SidePanelGroup>
  );
};
