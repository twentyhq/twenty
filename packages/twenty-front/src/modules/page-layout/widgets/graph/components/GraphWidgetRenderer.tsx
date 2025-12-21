import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { GraphWidgetComponentInstanceContext } from '@/page-layout/widgets/graph/states/contexts/GraphWidgetComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';
import { GraphType } from '~/generated/graphql';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  if (!widget.configuration || !('graphType' in widget.configuration)) {
    return <PageLayoutWidgetNoDataDisplay widgetId={widget.id} />;
  }

  const graphType = widget.configuration.graphType;

  if (
    !Object.values(GraphType).includes(graphType) ||
    !isDefined(widget.objectMetadataId)
  ) {
    return <PageLayoutWidgetNoDataDisplay widgetId={widget.id} />;
  }

  return (
    <GraphWidgetComponentInstanceContext.Provider
      value={{ instanceId: widget.id }}
    >
      <GraphWidget
        widget={widget}
        objectMetadataId={widget.objectMetadataId}
        graphType={graphType}
      />
    </GraphWidgetComponentInstanceContext.Provider>
  );
};
