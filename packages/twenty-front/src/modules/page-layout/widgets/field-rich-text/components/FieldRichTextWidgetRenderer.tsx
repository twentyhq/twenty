import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { lazy, Suspense } from 'react';

const FieldRichTextWidget = lazy(() =>
  import(
    '@/page-layout/widgets/field-rich-text/components/FieldRichTextWidget'
  ).then((module) => ({
    default: module.FieldRichTextWidget,
  })),
);

type FieldRichTextWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const FieldRichTextWidgetRenderer = ({
  widget,
}: FieldRichTextWidgetRendererProps) => {
  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <FieldRichTextWidget widget={widget} />
    </Suspense>
  );
};
