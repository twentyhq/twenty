import { FieldsWidget } from '@/page-layout/widgets/fields/components/FieldsWidget';
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
      return <GraphWidgetRenderer widget={widget} />;

    case WidgetType.IFRAME:
      return <IframeWidget widget={widget} />;

    case WidgetType.FIELDS:
      return <FieldsWidget widget={widget} />;

    default:
      return null;
  }
};
