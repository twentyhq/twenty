import { WidgetVariantSelectionSection } from '@/side-panel/pages/page-layout/components/WidgetVariantSelectionSection';
import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { GRAPH_TYPE_OPTIONS } from '@/side-panel/pages/page-layout/constants/GraphTypeOptions';
import { type GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { useLingui } from '@lingui/react/macro';

type ChartTypeSelectionSectionProps = {
  currentGraphType: GraphType;
  setCurrentGraphType: (graphType: GraphType) => void;
};

export const ChartTypeSelectionSection = ({
  currentGraphType,
  setCurrentGraphType,
}: ChartTypeSelectionSectionProps) => {
  const { t } = useLingui();

  return (
    <WidgetVariantSelectionSection
      ariaLabel={t`Chart type`}
      options={GRAPH_TYPE_OPTIONS.map((graphType) => ({
        variant: graphType,
        Icon: GRAPH_TYPE_INFORMATION[graphType].icon,
        label: t(GRAPH_TYPE_INFORMATION[graphType].label),
      }))}
      currentVariant={currentGraphType}
      onSelect={setCurrentGraphType}
    />
  );
};
