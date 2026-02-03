import { Suspense, lazy } from 'react';

import { isDefined } from 'twenty-shared/utils';

import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

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

  return (
    <Suspense fallback={null}>
      <FrontComponentRenderer frontComponentId={frontComponentId} />
    </Suspense>
  );
};
