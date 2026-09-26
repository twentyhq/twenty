import { ChatThreadsCard } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCard';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

type ChatThreadsWidgetProps = {
  widget: PageLayoutWidget;
};

export const ChatThreadsWidget = ({ widget }: ChatThreadsWidgetProps) => (
  <WidgetContentShell>
    <ChatThreadsCard widgetId={widget.id} />
  </WidgetContentShell>
);
