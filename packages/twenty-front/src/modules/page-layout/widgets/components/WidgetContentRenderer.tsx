import { validatePageLayoutWidget } from '@/page-layout/utils/validatePageLayoutWidget';
import { GraphWidgetRenderer } from '@/page-layout/widgets/graph/components/GraphWidgetRenderer';
import { IframeWidget } from '@/page-layout/widgets/iframe/components/IframeWidget';
import { isDefined } from 'twenty-shared/utils';
import { type PageLayoutWidget } from '~/generated-metadata/graphql';
import { WidgetType } from '~/generated/graphql';

type WidgetContentRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetContentRenderer = ({
  widget,
}: WidgetContentRendererProps) => {
  const validatedWidget = validatePageLayoutWidget(widget);

  if (!isDefined(validatedWidget)) {
    console.log(
      `WidgetContentRenderer: Invalid widget configuration for widget ID ${widget.id}`,
      JSON.stringify(widget),
    );
    return null;
  }

  switch (validatedWidget.type) {
    case WidgetType.GRAPH:
      return <GraphWidgetRenderer widget={validatedWidget} />;

    case WidgetType.IFRAME:
      return (
        <IframeWidget
          url={validatedWidget.configuration.url}
          title={validatedWidget.title}
        />
      );

    default:
      return null;
  }
};
