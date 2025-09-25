import { type GraphWidget } from '@/page-layout/widgets/graph/types/GraphWidget';
import { validateGraphConfiguration } from '@/page-layout/widgets/graph/utils/validateGraphConfiguration';
import { type IframeWidget } from '@/page-layout/widgets/iframe/types/IframeWidget';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { isString } from '@sniptt/guards';
import { type PageLayoutWidget } from '~/generated-metadata/graphql';
import { WidgetType } from '~/generated/graphql';

export const validatePageLayoutWidget = (
  widget: PageLayoutWidget,
): Widget | null => {
  switch (widget.type) {
    case WidgetType.GRAPH: {
      const validatedConfiguration = validateGraphConfiguration(
        widget.configuration,
      );

      if (!validatedConfiguration) {
        return null;
      }

      return {
        ...widget,
        configuration: validatedConfiguration,
      } as GraphWidget;
    }

    case WidgetType.IFRAME: {
      if (
        !widget.configuration ||
        typeof widget.configuration !== 'object' ||
        !('url' in widget.configuration) ||
        !isString(widget.configuration.url)
      ) {
        return null;
      }

      return {
        ...widget,
        configuration: {
          url: widget.configuration.url,
        },
      } as IframeWidget;
    }

    default:
      return null;
  }
};
