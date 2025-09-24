import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { validatePageLayoutWidget } from '@/page-layout/utils/validatePageLayoutWidget';
import { GraphWidgetRenderer } from '@/page-layout/widgets/graph/components/GraphWidgetRenderer';
import { IframeWidget } from '@/page-layout/widgets/iframe/components/IframeWidget';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated/graphql';

type WidgetContentRendererProps = {
  widget: PageLayoutWidgetWithData;
};

export const WidgetContentRenderer = ({
  widget,
}: WidgetContentRendererProps) => {
  const validatedWidget = validatePageLayoutWidget(widget);

  if (!isDefined(validatedWidget)) {
    console.log('Invalid widget configuration', JSON.stringify(widget));
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
