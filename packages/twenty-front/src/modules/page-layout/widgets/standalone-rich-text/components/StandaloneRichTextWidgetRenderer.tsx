import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
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
    <Suspense fallback={<WidgetSkeletonLoader />}>
      <StandaloneRichTextWidget widget={widget} />
    </Suspense>
  );
};
