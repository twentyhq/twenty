import { t } from '@lingui/core/macro';
import { AppTooltip, Status } from 'twenty-ui/display';

type PageLayoutWidgetNoDataDisplayProps = {
  widgetId: string;
};

export const PageLayoutWidgetNoDataDisplay = ({
  widgetId,
}: PageLayoutWidgetNoDataDisplayProps) => {
  const tooltipId = `widget-incomplete-tooltip-${widgetId}`;

  return (
    <>
      <div id={tooltipId}>
        <Status color="red" text={t`No Data`} />
      </div>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={t`No data available. Click edit to configure this widget.`}
        place="top"
      />
    </>
  );
};
