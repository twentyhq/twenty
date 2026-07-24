import { MessageCampaignCard } from '@/activities/emails/components/MessageCampaignCard';
import { getMessageCampaignWidgetSection } from '@/activities/emails/types/MessageCampaignWidgetSection';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

type MessageCampaignWidgetProps = {
  widget: PageLayoutWidget;
};

export const MessageCampaignWidget = ({
  widget,
}: MessageCampaignWidgetProps) => {
  return (
    <MessageCampaignCard
      section={getMessageCampaignWidgetSection(widget.title)}
    />
  );
};
