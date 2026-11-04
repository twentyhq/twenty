import { EmailsCard } from '@/activities/emails/components/EmailsCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';

type MessagesWidgetProps = {
  widget: PageLayoutWidget;
};

export const MessagesWidget = ({ widget: _widget }: MessagesWidgetProps) => (
  <WidgetContentShell>
    <EmailsCard />
  </WidgetContentShell>
);
