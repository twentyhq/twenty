import { isDefined } from 'twenty-shared/utils';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { FrontComponentWidgetContent } from '@/page-layout/widgets/front-component/components/FrontComponentWidgetContent';

type FrontComponentWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const FrontComponentWidgetRenderer = ({
  widget,
}: FrontComponentWidgetRendererProps) => {
  const configuration = widget.configuration;

  if (!isDefined(configuration) || !('frontComponentId' in configuration)) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  const frontComponentId = configuration.frontComponentId;

  return <FrontComponentWidgetContent frontComponentId={frontComponentId} />;
};
