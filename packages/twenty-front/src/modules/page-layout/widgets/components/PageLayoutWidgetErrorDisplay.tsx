import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { t } from '@lingui/core/macro';

type PageLayoutWidgetErrorDisplayProps = {
  widgetId: string;
};

export const PageLayoutWidgetErrorDisplay = ({
  widgetId,
}: PageLayoutWidgetErrorDisplayProps) => {
  return (
    <PageLayoutWidgetStatusDisplay
      tooltipId={`widget-error-tooltip-${widgetId}`}
      text={t`Error`}
      tooltipContent={t`An error occurred while loading this widget.`}
    />
  );
};
