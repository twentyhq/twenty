import { ChatThreadMessages } from '@/activities/emails/components/ChatThreadMessages';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';

type ChatThreadWidgetContentProps = {
  messages: EmailThreadMessageWithSender[];
};

export const ChatThreadWidgetContent = ({
  messages,
}: ChatThreadWidgetContentProps) => (
  <StyledWidgetContentContainer>
    <WidgetRelationsHeader />
    <StyledWidgetScrollContainer>
      <ChatThreadMessages messages={messages} />
    </StyledWidgetScrollContainer>
  </StyledWidgetContentContainer>
);
