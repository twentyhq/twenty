import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { getDateGranularityLabel } from '@/command-menu/pages/page-layout/utils/getDateGranularityLabel';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { type WidgetConfiguration } from '~/generated/graphql';

type ChartDateGranularitySelectionDropdownContentProps = {
  axis?: 'primary' | 'secondary';
};

const getCurrentDateGranularity = ({
  configuration,
  axis,
}: {
  configuration: ChartConfiguration;
  axis?: 'primary' | 'secondary';
}) => {
  const defaultGranularity = ObjectRecordGroupByDateGranularity.DAY;

  if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return configuration.dateGranularity || defaultGranularity;
  }

  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (!isBarOrLineChart) {
    return defaultGranularity;
  }

  if (axis === 'primary') {
    return configuration.primaryAxisDateGranularity || defaultGranularity;
  }

  return (
    configuration.secondaryAxisGroupByDateGranularity || defaultGranularity
  );
};

const isChartConfiguration = (
  configuration:
    | WidgetConfiguration
    | FieldsConfiguration
    | FieldConfiguration
    | null
    | undefined,
): configuration is ChartConfiguration => {
  return (
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'GaugeChartConfiguration')
  );
};

export const ChartDateGranularitySelectionDropdownContent = ({
  axis,
}: ChartDateGranularitySelectionDropdownContentProps) => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;

  if (!isChartConfiguration(configuration)) {
    throw new Error('Invalid configuration type');
  }

  const isPieChart = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  );
  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (!isDefined(axis) && !isPieChart) {
    throw new Error('Invalid configuration type');
  }

  if (isDefined(axis) && !isBarOrLineChart) {
    throw new Error('Invalid configuration type');
  }

  const currentDateGranularity = getCurrentDateGranularity({
    configuration,
    axis: axis as 'primary' | 'secondary',
  });

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const dateGranularityOptions: ObjectRecordGroupByDateGranularity[] = [
    ObjectRecordGroupByDateGranularity.DAY,
    ObjectRecordGroupByDateGranularity.WEEK,
    ObjectRecordGroupByDateGranularity.MONTH,
    ObjectRecordGroupByDateGranularity.QUARTER,
    ObjectRecordGroupByDateGranularity.YEAR,
    ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
    ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
    ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
  ];

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectDateGranularityOption = (
    dateGranularityOption: ObjectRecordGroupByDateGranularity,
  ) => {
    const configToUpdate = axis
      ? axis === 'primary'
        ? { primaryAxisDateGranularity: dateGranularityOption }
        : { secondaryAxisGroupByDateGranularity: dateGranularityOption }
      : { dateGranularity: dateGranularityOption };

    updateCurrentWidgetConfig({
      configToUpdate,
    });
    closeDropdown();
  };

  return (
    <>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={dateGranularityOptions}
        >
          {dateGranularityOptions.map((option) => (
            <SelectableListItem
              key={option}
              itemId={option}
              onEnter={() => {
                handleSelectDateGranularityOption(option);
              }}
            >
              <MenuItemSelect
                text={getDateGranularityLabel(option)}
                selected={currentDateGranularity === option}
                focused={selectedItemId === option}
                onClick={() => {
                  handleSelectDateGranularityOption(option);
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
