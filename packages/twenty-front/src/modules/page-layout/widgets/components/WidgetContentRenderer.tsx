import { GraphWidgetRenderer } from '@/page-layout/widgets/graph/components/GraphWidgetRenderer';
import { IframeWidget } from '@/page-layout/widgets/iframe/components/IframeWidget';
import { type PageLayoutWidget, WidgetType } from '~/generated/graphql';

type WidgetContentRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetContentRenderer = ({
  widget,
}: WidgetContentRendererProps) => {
  switch (widget.type) {
    case WidgetType.GRAPH:
      // Check if configuration exists and has graphType (all graph configs have it)
      if (!widget.configuration || !('graphType' in widget.configuration)) {
        return null;
      }
      return <GraphWidgetRenderer widget={widget} />;

    case WidgetType.IFRAME: {
      const configuration = widget.configuration;
      if (!configuration || !('url' in configuration)) {
        return null;
      }
      return <IframeWidget url={configuration.url} title={widget.title} />;
    }

    default:
      return null;
  }
};
