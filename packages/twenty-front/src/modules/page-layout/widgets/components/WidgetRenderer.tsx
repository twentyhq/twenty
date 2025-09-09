import { IframeWidget } from '@/page-layout/widgets/iframe/components/IframeWidget';
import { isString } from '@sniptt/guards';
import { WidgetType } from '../../mocks/mockWidgets';
import { type PageLayoutWidget } from '../../states/savedPageLayoutsState';
import { GraphWidgetRenderer } from '../graph/components/GraphWidgetRenderer';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  switch (widget.type) {
    case WidgetType.GRAPH:
      return <GraphWidgetRenderer widget={widget} />;

    case WidgetType.IFRAME: {
      const url = widget.configuration?.url;
      return (
        <IframeWidget url={isString(url) ? url : ''} title={widget.title} />
      );
    }

    case WidgetType.VIEW:
      return null;

    case WidgetType.FIELDS:
      return null;

    default:
      return null;
  }
};
