import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';
import { AggregateOperations } from '~/generated-metadata/graphql';

type ChartRatioOptionBooleanSelectableListItemProps = {
  optionValue: string;
  label: string;
  currentFieldMetadataId: string;
};

export const ChartRatioOptionBooleanSelectableListItem = ({
  optionValue,
  label,
  currentFieldMetadataId,
}: ChartRatioOptionBooleanSelectableListItemProps) => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const currentRatioConfig = isWidgetConfigurationOfType(
    widgetInEditMode?.configuration,
    'AggregateChartConfiguration',
  )
    ? widgetInEditMode.configuration.ratioAggregateConfig
    : undefined;

  const isSelected = currentRatioConfig?.optionValue === optionValue;

  const handleClick = () => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        aggregateFieldMetadataId: currentFieldMetadataId,
        aggregateOperation: AggregateOperations.COUNT,
        ratioAggregateConfig: {
          fieldMetadataId: currentFieldMetadataId,
          optionValue,
        },
      },
    });
  };

  return (
    <Dropdown.OptionItem
      onSelect={handleClick}
      selected={isSelected}
      startIcon={
        <SelectOptionIcon Icon={optionValue === 'true' ? IconCheck : IconX} />
      }
    >
      {label}
    </Dropdown.OptionItem>
  );
};
