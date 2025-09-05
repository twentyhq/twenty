import { IframeWidget } from '@/dashboards/widgets/iframe/components/IframeWidget';
import { isString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { WidgetType } from '../mocks/mockWidgets';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';
import { renderGraphWidget } from './graphRegistry';

export const renderWidget = (widget: PageLayoutWidget): ReactNode => {
  switch (widget.type) {
    case WidgetType.GRAPH:
      return renderGraphWidget(widget);

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
