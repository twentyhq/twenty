import { GraphWidgetRenderer } from '@/page-layout/widgets/graph/components/GraphWidgetRenderer';
import { IframeWidget } from '@/page-layout/widgets/iframe/components/IframeWidget';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { isString } from '@sniptt/guards';
import { WidgetType } from '~/generated/graphql';

type WidgetContentRendererProps = {
  widget: Widget;
};

export const WidgetContentRenderer = ({
  widget,
}: WidgetContentRendererProps) => {
  switch (widget.type) {
    case WidgetType.GRAPH:
      return <GraphWidgetRenderer widget={widget} />;

    case WidgetType.IFRAME: {
      const url = widget.configuration?.url;
      return (
        <IframeWidget url={isString(url) ? url : ''} title={widget.title} />
      );
    }
    default:
      return null;
  }
};
