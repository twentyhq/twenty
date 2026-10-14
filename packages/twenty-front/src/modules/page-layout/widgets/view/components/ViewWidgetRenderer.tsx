import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { StyledWidgetTableOutline } from '@/page-layout/widgets/components/WidgetContentFrame';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { useViewById } from '@/views/hooks/useViewById';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type ViewWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const ViewWidgetRenderer = ({ widget }: ViewWidgetRendererProps) => {
  const viewId = getWidgetConfigurationViewId(widget.configuration);

  const { view } = useViewById(viewId);

  if (!isDefined(widget.objectMetadataId) || !isDefined(view)) {
    return (
      <PageLayoutWidgetStatusDisplay
        tooltipId={`widget-view-unavailable-tooltip-${widget.id}`}
        text={t`View unavailable`}
        tooltipContent={t`The view shown by this widget was deleted. Select another view in the widget settings.`}
        color="gray"
      />
    );
  }

  return (
    <StyledWidgetTableOutline>
      <RecordTableWidgetRendererContent
        objectMetadataId={widget.objectMetadataId}
        viewId={view.id}
        widgetId={widget.id}
        isEmptyStateHidden
        isViewLocked
      />
    </StyledWidgetTableOutline>
  );
};
