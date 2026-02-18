import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
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
    <Suspense fallback={<WidgetSkeletonLoader />}>
      <FieldRichTextWidget widget={widget} />
    </Suspense>
  );
};
