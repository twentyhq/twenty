import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  if (!isDefined(widget.configuration)) {
    return <PageLayoutWidgetNoDataDisplay widgetId={widget.id} />;
  }

  if (!isDefined(widget.objectMetadataId)) {
    return <PageLayoutWidgetNoDataDisplay widgetId={widget.id} />;
  }

  return (
    <GraphWidgetComponentInstanceContext.Provider
      value={{ instanceId: widget.id }}
    >
      <GraphWidget widget={widget} objectMetadataId={widget.objectMetadataId} />
    </GraphWidgetComponentInstanceContext.Provider>
  );
};
