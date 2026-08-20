import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRendererContent } from '@/page-layout/widgets/components/WidgetRendererContent';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => (
  <WidgetRendererContent widget={widget} />
);
