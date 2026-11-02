import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { ChatThreadMessages } from '@/activities/emails/components/ChatThreadMessages';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';

type ChatThreadWidgetContentProps = {
  messages: EmailThreadMessageWithSender[];
  loading: boolean;
  onFetchMoreMessages: () => void;
};

export const ChatThreadWidgetContent = ({
  messages,
  loading,
  onFetchMoreMessages,
}: ChatThreadWidgetContentProps) => (
  <StyledWidgetContentContainer>
    <WidgetRelationsHeader />
    <StyledWidgetScrollContainer>
      <ChatThreadMessages messages={messages} />
      <CustomResolverFetchMoreLoader
        loading={loading}
        onLastRowVisible={onFetchMoreMessages}
      />
    </StyledWidgetScrollContainer>
  </StyledWidgetContentContainer>
);
