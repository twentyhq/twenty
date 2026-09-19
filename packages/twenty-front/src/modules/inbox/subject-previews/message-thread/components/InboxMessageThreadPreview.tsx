import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { type InboxSubjectPreviewProps } from '@/inbox/subject-previews/types/InboxSubjectPreview';
import { EmailThreadIntermediaryMessages } from '@/page-layout/widgets/email-thread/components/EmailThreadIntermediaryMessages';

type InboxMessageThreadPreviewProps = InboxSubjectPreviewProps;

// The conversation, read in place. Replying is not this component's to
// offer: the email tool declares that it can start from a thread, and the
// slot draws that starter under the preview.
export const InboxMessageThreadPreview = ({
  subjectRecordId,
}: InboxMessageThreadPreviewProps) => {
  const { t } = useLingui();
  const { thread, messages, fetchMoreMessages, threadLoading } =
    useEmailThread(subjectRecordId);

  const messagesCount = messages.length;
  const is5OrMoreMessages = messagesCount >= 5;
  const firstMessages = messages.slice(
    0,
    is5OrMoreMessages ? 2 : messagesCount - 1,
  );
  const intermediaryMessages = is5OrMoreMessages
    ? messages.slice(2, messagesCount - 1)
    : [];
  const lastMessage = messages[messagesCount - 1];

  const isThreadReady =
    !threadLoading && isDefined(thread) && isDefined(lastMessage);

  if (!isThreadReady) {
    return <EmailLoader loadingText={t`Loading thread`} />;
  }

  // A draft in the thread is read like any other message here; it is edited
  // from the mailbox, not from the inbox.
  const openDraft = () => undefined;

  return (
    <>
      {firstMessages.map((message) => (
        <EmailThreadMessage
          key={message.id}
          message={message}
          onDraftClick={openDraft}
        />
      ))}
      <EmailThreadIntermediaryMessages
        messages={intermediaryMessages}
        onDraftClick={openDraft}
      />
      <EmailThreadMessage
        key={lastMessage.id}
        message={lastMessage}
        isExpanded
        hideBottomBorder
        onDraftClick={openDraft}
      />
      <CustomResolverFetchMoreLoader
        loading={threadLoading}
        onLastRowVisible={fetchMoreMessages}
      />
    </>
  );
};
