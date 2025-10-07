import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { isDefined } from 'twenty-shared/utils';
import { GraphType, type PageLayoutWidget } from '~/generated-metadata/graphql';

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
    <GraphWidget
      widget={widget}
      objectMetadataId={widget.objectMetadataId}
      graphType={graphType}
    />
  );
};
