import { isDefined } from 'twenty-shared/utils';

import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';

type FrontComponentWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const FrontComponentWidgetRenderer = ({
  widget,
}: FrontComponentWidgetRendererProps) => {
  const configuration = widget.configuration;

  if (
    !isDefined(configuration) ||
    !isWidgetConfigurationOfType(configuration, 'FrontComponentConfiguration')
  ) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  const frontComponentId = configuration.frontComponentId;

  return <FrontComponentRenderer frontComponentId={frontComponentId} />;
};
