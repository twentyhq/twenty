import { EmailsCard } from '@/activities/emails/components/EmailsCard';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';
import { Suspense } from 'react';

type EmailWidgetProps = {
  widget: PageLayoutWidget;
};

export const EmailWidget = ({ widget: _widget }: EmailWidgetProps) => (
  <WidgetContentShell>
    <Suspense fallback={<SkeletonLoader />}>
      <EmailsCard />
    </Suspense>
  </WidgetContentShell>
);
