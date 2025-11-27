import { getChartLimitMessage } from '@/command-menu/pages/page-layout/utils/getChartLimitMessage';
import { t } from '@lingui/core/macro';
import { SidePanelInformationBanner } from 'twenty-ui/display';

import { type GraphType } from '~/generated/graphql';

type ChartLimitInfoBannerProps = {
  graphType: GraphType;
  isPrimaryAxisDate: boolean;
  primaryAxisDateGranularity: Parameters<
    typeof getChartLimitMessage
  >[0]['primaryAxisDateGranularity'];
};

export const ChartLimitInfoBanner = ({
  graphType,
  isPrimaryAxisDate,
  primaryAxisDateGranularity,
}: ChartLimitInfoBannerProps) => {
  return (
    <SidePanelInformationBanner
      message={getChartLimitMessage({
        graphType,
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
