import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { useDashboardFiltersForWidgetBindings } from '@/side-panel/pages/page-layout/hooks/useDashboardFiltersForWidgetBindings';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { getDashboardFilterBindingItemId } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingItemId';
import { getDashboardFilterBindingsOverlappingWidgetFilter } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingsOverlappingWidgetFilter';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import {
  isDefined,
  isFieldBindableToDashboardFilter,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { formatDisplayList } from '~/utils/format/formatDisplayList';

const NOT_APPLIED_OPTION_VALUE = 'not-applied';

type WidgetDashboardFilterBindingsSectionProps = {
  widget: PageLayoutWidget;
  widgetFilterFieldMetadataIds: string[];
};

export const WidgetDashboardFilterBindingsSection = ({
  widget,
  widgetFilterFieldMetadataIds,
}: WidgetDashboardFilterBindingsSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { openDropdown } = useOpenDropdown();
  const { objectMetadataItems } = useObjectMetadataItems();
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

  const persistedWidget = pageLayoutPersisted?.tabs
    .flatMap((tab) => tab.widgets)
    .find(({ id }) => id === widget.id);

  // An unsaved copy of an app's widget becomes workspace-owned on save
  const isReadOnly = useIsThirdPartyApplication(persistedWidget?.applicationId);

  if (!isNonEmptyArray(pageLayoutFilters)) {
    return null;
  }

  const objectMetadataItem = objectMetadataItems.find(
    ({ id }) => id === widget.objectMetadataId,
  );

  const dashboardFilterBindings =
    'dashboardFilterBindings' in widget.configuration
      ? (widget.configuration.dashboardFilterBindings ?? [])
      : [];

  const getFieldLabel = (fieldMetadataId: string | undefined) =>
    objectMetadataItem?.fields.find(({ id }) => id === fieldMetadataId)?.label;

  const overlappingFieldLabels = [
    ...new Set(
      getDashboardFilterBindingsOverlappingWidgetFilter({
        dashboardFilterBindings,
        pageLayoutFilterIds: pageLayoutFilters.map(({ id }) => id),
        widgetFilterFieldMetadataIds,
      })
        .map(({ fieldMetadataId }) => getFieldLabel(fieldMetadataId))
        .filter(isDefined),
    ),
  ];

  const overlappingFieldList = formatDisplayList(overlappingFieldLabels);

  const handleFieldChange = ({
    pageLayoutFilterId,
    fieldMetadataId,
  }: {
    pageLayoutFilterId: string;
    fieldMetadataId: string | null;
  }) => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        dashboardFilterBindings: [
          ...dashboardFilterBindings.filter(
            (binding) => binding.pageLayoutFilterId !== pageLayoutFilterId,
          ),
          ...(isDefined(fieldMetadataId)
            ? [{ pageLayoutFilterId, fieldMetadataId }]
            : []),
        ],
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
      {pageLayoutFilters.map((pageLayoutFilter) => {
        const itemId = getDashboardFilterBindingItemId(pageLayoutFilter.id);

        const boundFieldMetadataId = dashboardFilterBindings.find(
          ({ pageLayoutFilterId }) =>
            pageLayoutFilterId === pageLayoutFilter.id,
        )?.fieldMetadataId;

        const bindableFieldMetadataItems = (
          objectMetadataItem?.readableFields ?? []
        ).filter(
          (field) =>
            field.isActive &&
            isFieldBindableToDashboardFilter({
              field,
              filterType: pageLayoutFilter.type,
            }),
        );

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
                  getFieldLabel(boundFieldMetadataId) ?? t`Not applied`
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
                    value={boundFieldMetadataId ?? NOT_APPLIED_OPTION_VALUE}
                    onValueChange={(selectedValue) =>
                      handleFieldChange({
                        pageLayoutFilterId: pageLayoutFilter.id,
                        fieldMetadataId:
                          selectedValue === NOT_APPLIED_OPTION_VALUE
                            ? null
                            : selectedValue,
                      })
                    }
                  >
                    <Dropdown.OptionItem
                      value={NOT_APPLIED_OPTION_VALUE}
                    >{t`Not applied`}</Dropdown.OptionItem>
                    {bindableFieldMetadataItems.map((fieldMetadataItem) => (
                      <Dropdown.OptionItem
                        key={fieldMetadataItem.id}
                        value={fieldMetadataItem.id}
                        startIcon={
                          <SelectOptionIcon
                            Icon={getIcon(fieldMetadataItem.icon)}
                          />
                        }
                      >
                        {fieldMetadataItem.label}
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
