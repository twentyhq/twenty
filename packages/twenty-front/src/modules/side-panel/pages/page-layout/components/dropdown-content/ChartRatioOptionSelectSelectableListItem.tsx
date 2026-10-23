import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Dropdown } from 'twenty-ui/components/navigation';
import { type ThemeColor } from 'twenty-ui/theme';
import { AggregateOperations } from '~/generated-metadata/graphql';

type ChartRatioOptionSelectSelectableListItemProps = {
  optionValue: string;
  label: string;
  color: ThemeColor | undefined;
  currentFieldMetadataId: string;
};

export const ChartRatioOptionSelectSelectableListItem = ({
  optionValue,
  label,
  color,
  currentFieldMetadataId,
}: ChartRatioOptionSelectSelectableListItemProps) => {
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
    <Dropdown.OptionItem onSelect={handleClick} selected={isSelected}>
      <Tag color={color ?? 'transparent'}>{label}</Tag>
    </Dropdown.OptionItem>
  );
};
