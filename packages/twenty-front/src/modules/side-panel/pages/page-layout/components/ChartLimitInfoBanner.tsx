import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { getChartLimitMessage } from '@/side-panel/pages/page-layout/utils/getChartLimitMessage';
import { type WidgetConfigurationType } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

type ChartLimitInfoBannerProps = {
  widgetConfigurationType: WidgetConfigurationType;
  isPrimaryAxisDate: boolean;
  primaryAxisDateGranularity: Parameters<
    typeof getChartLimitMessage
  >[0]['primaryAxisDateGranularity'];
};

export const ChartLimitInfoBanner = ({
  widgetConfigurationType,
  isPrimaryAxisDate,
  primaryAxisDateGranularity,
}: ChartLimitInfoBannerProps) => {
  const { t } = useLingui();
  return (
    <SidePanelInformationBanner
      message={getChartLimitMessage({
        widgetConfigurationType,
        isPrimaryAxisDate,
        primaryAxisDateGranularity,
      })}
      tooltipMessage={
        isPrimaryAxisDate
          ? t`Consider adding a filter or changing the date granularity to display more data.`
          : t`Consider adding a filter to display more data.`
      }
      variant="warning"
    />
  );
};
