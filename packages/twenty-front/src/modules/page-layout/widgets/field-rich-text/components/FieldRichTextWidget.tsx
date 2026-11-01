import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldRichTextCard } from '@/page-layout/widgets/field-rich-text/components/FieldRichTextCard';

type FieldRichTextWidgetProps = {
  widget: PageLayoutWidget;
};

export const FieldRichTextWidget = ({
  widget: _widget,
}: FieldRichTextWidgetProps) => {
  return <FieldRichTextCard />;
};
