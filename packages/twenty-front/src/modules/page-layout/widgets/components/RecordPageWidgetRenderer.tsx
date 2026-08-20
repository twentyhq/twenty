import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRendererContent } from '@/page-layout/widgets/components/WidgetRendererContent';

type RecordPageWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordPageWidgetRenderer = ({
  widget,
}: RecordPageWidgetRendererProps) => <WidgetRendererContent widget={widget} />;
