import { type ReactNode } from 'react';

import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';

type CoreWorkflowOverviewWidgetProps = {
  widgetId: string;
  title: string;
  children: ReactNode;
};

export const CoreWorkflowOverviewWidget = ({
  widgetId,
  title,
  children,
}: CoreWorkflowOverviewWidgetProps) => (
  <WidgetCard
    variant="framed"
    isEditable={false}
    isEditing={false}
    isDragging={false}
    isResizing={false}
  >
    <WidgetCardHeader
      variant="framed"
      widgetId={widgetId}
      isInEditMode={false}
      title={title}
    />
    <WidgetCardContent variant="framed" hasHeader isEditable={false}>
      {children}
    </WidgetCardContent>
  </WidgetCard>
);
