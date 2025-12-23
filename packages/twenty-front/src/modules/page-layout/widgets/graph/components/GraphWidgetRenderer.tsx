import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { isDefined } from 'twenty-shared/utils';
import { GraphType } from '~/generated/graphql';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  if (!widget.configuration || !('graphType' in widget.configuration)) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  const graphType = widget.configuration.graphType;

  if (
    !Object.values(GraphType).includes(graphType) ||
    !isDefined(widget.objectMetadataId)
  ) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return (
    <GraphWidget
      objectMetadataId={widget.objectMetadataId}
      graphType={graphType}
    />
  );
};
