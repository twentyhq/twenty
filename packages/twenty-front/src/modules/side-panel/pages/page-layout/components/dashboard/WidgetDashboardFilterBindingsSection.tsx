import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getDashboardFilterBindingsWithWidgetSetting } from '@/page-layout/utils/getDashboardFilterBindingsWithWidgetSetting';
import { getPageLayoutWidgetViewFilterFieldMetadataIds } from '@/page-layout/utils/getPageLayoutWidgetViewFilterFieldMetadataIds';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { getWidgetDashboardFilterSettings } from '@/page-layout/utils/getWidgetDashboardFilterSettings';
import { isPersistedPageLayoutWidgetReadOnly } from '@/page-layout/utils/isPersistedPageLayoutWidgetReadOnly';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { useDashboardFiltersForWidgetBindings } from '@/side-panel/pages/page-layout/hooks/useDashboardFiltersForWidgetBindings';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { getDashboardFilterBindingItemId } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingItemId';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsByIdMapSelector } from '@/views/states/selectors/viewsByIdMapSelector';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { formatDisplayList } from '~/utils/format/formatDisplayList';

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

  const { settings, overlappingFieldLabels } = getWidgetDashboardFilterSettings(
    {
      pageLayoutFilters,
      configuration: widget.configuration,
      fields: isDefined(widget.objectMetadataId)
        ? (objectMetadataItemsByIdMap.get(widget.objectMetadataId)?.fields ??
          [])
        : [],
      viewFilterFieldMetadataIds: getPageLayoutWidgetViewFilterFieldMetadataIds(
        {
          widget,
          viewsById: viewsByIdMap,
          recordTableWidgetViewDrafts: recordTableWidgetViewDraft,
        },
      ),
    },
  );

  const overlappingFieldList = formatDisplayList(overlappingFieldLabels);

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
      {isNonEmptyArray(overlappingFieldLabels) && (
        <SidePanelInformationBanner
          variant="warning"
          message={t`This widget's own filter also uses ${overlappingFieldList}. Both apply, so it only shows records that match both.`}
        />
      )}
      {settings.map(({ pageLayoutFilter, value, options }) => {
        const itemId = getDashboardFilterBindingItemId(pageLayoutFilter.id);

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
              <CommandMenuItemDropdownTrigger
                id={itemId}
                Icon={IconFilter}
                label={pageLayoutFilter.label}
                description={
                  options.find((option) => option.value === value)?.label
                }
                contextualTextPosition="right"
                disabled={isReadOnly}
              />
              <DropdownContent
                side="bottom"
                align="end"
                collisionPadding={{ left: 0, right: 0 }}
              >
                <ChartSettingsDropdownSection>
                  <Dropdown.SelectionGroup
                    aria-label={pageLayoutFilter.label}
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
                      <Dropdown.OptionItem
                        key={option.value}
                        value={option.value}
                        startIcon={
                          isNonEmptyString(option.iconName) ? (
                            <SelectOptionIcon Icon={getIcon(option.iconName)} />
                          ) : undefined
                        }
                      >
                        {option.label}
                      </Dropdown.OptionItem>
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
