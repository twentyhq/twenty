import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { WidgetType } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const PageLayoutWidgetNoDataDisplay = () => {
  const { t } = useLingui();
  const widget = useCurrentWidget();

  const text = widget.type === WidgetType.IFRAME ? t`Invalid URL` : t`No Data`;
  const tooltipContent =
    widget.type === WidgetType.IFRAME
      ? t`Invalid URL. Click edit to configure this widget.`
      : t`No data available. Click edit to configure this widget.`;

  return (
    <PageLayoutWidgetStatusDisplay
      tooltipId={`widget-incomplete-tooltip-${widget.id}`}
      text={text}
      tooltipContent={tooltipContent}
    />
  );
};
