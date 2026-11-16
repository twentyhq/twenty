import { type ReactNode } from 'react';

import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';

type CoreObjectOverviewWidgetProps = {
  title: string;
  children: ReactNode;
};

export const CoreObjectOverviewWidget = ({
  title,
  children,
}: CoreObjectOverviewWidgetProps) => (
  <WidgetCard
    variant="framed"
    isEditable={false}
    isEditing={false}
    isDragging={false}
    isResizing={false}
  >
    <WidgetCardHeader variant="framed" isInEditMode={false} title={title} />
    <WidgetCardContent variant="framed" hasHeader isEditable={false}>
      {children}
    </WidgetCardContent>
  </WidgetCard>
);
