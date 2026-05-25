import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { NonRecordPageWidgetRenderer } from '@/page-layout/widgets/components/NonRecordPageWidgetRenderer';
import { RecordPageWidgetRenderer } from '@/page-layout/widgets/components/RecordPageWidgetRenderer';
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

  return <NonRecordPageWidgetRenderer widget={widget} />;
};
