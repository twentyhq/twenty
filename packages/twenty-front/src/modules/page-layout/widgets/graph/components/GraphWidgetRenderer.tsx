import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  if (!isDefined(widget.configuration)) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  if (!isDefined(widget.objectMetadataId)) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return <GraphWidget objectMetadataId={widget.objectMetadataId} />;
};
