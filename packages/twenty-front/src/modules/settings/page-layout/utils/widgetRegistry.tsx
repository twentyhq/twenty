import { IframeWidget } from '@/dashboards/widgets/components/IframeWidget';
import { type ReactNode } from 'react';
import { WidgetType, type Widget } from '../mocks/mockWidgets';
import { renderGraphWidget } from './graphRegistry';

export const renderWidget = (widget: Widget): ReactNode => {
  switch (widget.type) {
    case WidgetType.GRAPH:
      return renderGraphWidget(widget);

    case WidgetType.IFRAME:
      return (
        <IframeWidget
          url={widget.configuration?.url || widget.data?.url || ''}
          title={widget.title}
        />
      );

    case WidgetType.VIEW:
      return null;

    case WidgetType.FIELDS:
      return null;

    default:
      return null;
  }
};
