import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { RecordPageWidgetRenderer } from '@/page-layout/widgets/components/RecordPageWidgetRenderer';
import { WidgetRendererContent } from '@/page-layout/widgets/components/WidgetRendererContent';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { PageLayoutType } from '~/generated-metadata/graphql';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  const { layoutType } = useLayoutRenderingContext();

  if (layoutType === PageLayoutType.RECORD_PAGE) {
    return <RecordPageWidgetRenderer widget={widget} />;
  }

  return <WidgetRendererContent widget={widget} />;
};
