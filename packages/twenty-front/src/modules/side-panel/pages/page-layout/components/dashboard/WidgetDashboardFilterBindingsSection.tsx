import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { getDashboardFilterBindableFieldMetadataItems } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindableFieldMetadataItems';
import { getDashboardFilterBindingItemId } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingItemId';
import { getDashboardFilterBindingsOverlappingWidgetFilter } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingsOverlappingWidgetFilter';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

const NOT_APPLIED_OPTION_VALUE = 'not-applied';

type WidgetDashboardFilterBindingsSectionProps = {
  pageLayoutId: string;
  pageLayoutFilters: PageLayoutFilter[];
  widget: PageLayoutWidget;
  widgetFilterFieldMetadataIds: string[];
};

export const WidgetDashboardFilterBindingsSection = ({
  pageLayoutId,
  pageLayoutFilters,
  widget,
  widgetFilterFieldMetadataIds,
}: WidgetDashboardFilterBindingsSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { openDropdown } = useOpenDropdown();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const isReadOnly = useIsThirdPartyApplication(widget.applicationId);

  if (
    !isNonEmptyArray(pageLayoutFilters) ||
    !isDefined(widget.objectMetadataId)
  ) {
    return null;
  }

  const objectMetadataItem = objectMetadataItems.find(
    ({ id }) => id === widget.objectMetadataId,
  );

  const dashboardFilterBindings =
    'dashboardFilterBindings' in widget.configuration
      ? (widget.configuration.dashboardFilterBindings ?? [])
      : [];

  const getFieldLabel = (fieldMetadataId: string) =>
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
  ].join(', ');

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
      {isNonEmptyString(overlappingFieldLabels) && (
        <SidePanelInformationBanner
          variant="warning"
          message={t`This widget's own filter also uses ${overlappingFieldLabels}. Both apply, so it only shows records that match both.`}
        />
      )}
      {pageLayoutFilters.map((pageLayoutFilter) => {
        const itemId = getDashboardFilterBindingItemId(pageLayoutFilter.id);

        const boundFieldMetadataId = dashboardFilterBindings.find(
          ({ pageLayoutFilterId }) =>
            pageLayoutFilterId === pageLayoutFilter.id,
        )?.fieldMetadataId;

        const boundFieldLabel = isDefined(boundFieldMetadataId)
          ? getFieldLabel(boundFieldMetadataId)
          : undefined;

        const bindableFieldMetadataItems =
          getDashboardFilterBindableFieldMetadataItems({
            fieldMetadataItems: objectMetadataItem?.readableFields ?? [],
            pageLayoutFilterType: pageLayoutFilter.type,
          });

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
                description={boundFieldLabel ?? t`Not applied`}
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
                  >
                    <Dropdown.OptionItem
                      value={NOT_APPLIED_OPTION_VALUE}
                      onSelect={() =>
                        handleFieldChange({
                          pageLayoutFilterId: pageLayoutFilter.id,
                          fieldMetadataId: null,
                        })
                      }
                    >{t`Not applied`}</Dropdown.OptionItem>
                    {bindableFieldMetadataItems.map((fieldMetadataItem) => (
                      <Dropdown.OptionItem
                        key={fieldMetadataItem.id}
                        value={fieldMetadataItem.id}
                        onSelect={() =>
                          handleFieldChange({
                            pageLayoutFilterId: pageLayoutFilter.id,
                            fieldMetadataId: fieldMetadataItem.id,
                          })
                        }
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
