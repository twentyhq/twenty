import { EmailsCard } from '@/activities/emails/components/EmailsCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';

type EmailWidgetProps = {
  widget: PageLayoutWidget;
};

export const EmailWidget = ({ widget: _widget }: EmailWidgetProps) => (
  <WidgetContentShell>
    <EmailsCard />
  </WidgetContentShell>
);
