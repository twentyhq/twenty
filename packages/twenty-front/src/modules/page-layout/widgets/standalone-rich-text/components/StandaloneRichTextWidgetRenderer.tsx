import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { lazy, Suspense } from 'react';

const StandaloneRichTextWidget = lazy(() =>
  import(
    '@/page-layout/widgets/standalone-rich-text/components/StandaloneRichTextWidget'
  ).then((module) => ({
    default: module.StandaloneRichTextWidget,
  })),
);

type StandaloneRichTextWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const StandaloneRichTextWidgetRenderer = ({
  widget,
}: StandaloneRichTextWidgetRendererProps) => {
  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <StandaloneRichTextWidget widget={widget} />
    </Suspense>
  );
};
