import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { hasMinimalRequiredConfigForGraph } from '@/page-layout/widgets/graph/utils/hasMinimalRequiredConfigForGraph';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  if (
    !isDefined(widget.configuration) ||
    !isDefined(widget.objectMetadataId) ||
    !hasMinimalRequiredConfigForGraph(widget.configuration)
  ) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return <GraphWidget />;
};
