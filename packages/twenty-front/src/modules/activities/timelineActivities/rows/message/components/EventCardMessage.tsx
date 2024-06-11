import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { OverflowingTextWithTooltip } from 'twenty-ui';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { EventCardMessageNotShared } from '@/activities/timelineActivities/rows/message/components/EventCardMessageNotShared';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useSetRecordInStore } from '@/object-record/record-store/hooks/useSetRecordInStore';
import { isDefined } from '~/utils/isDefined';

const StyledEventCardMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
`;

const StyledEmailTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmailTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
`;

const StyledEmailParticipants = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledEmailBody = styled.div`
  cursor: pointer;
  display: flex;
`;

export const EventCardMessage = ({
  messageId,
  authorFullName,
}: {
  messageId: string;
  authorFullName: string;
}) => {
  const { setRecords } = useSetRecordInStore();

  const {
    record: message,
    loading,
    error,
  } = useFindOneRecord<EmailThreadMessage>({
    objectNameSingular: CoreObjectNameSingular.Message,
    objectRecordId: messageId,
    recordGqlFields: {
      text: true,
      subject: true,
      direction: true,
      messageThreadId: true,
      messageParticipants: {
        handle: true,
      },
    },
    onCompleted: (data) => {
      setRecords([data]);
    },
  });

  const { openEmailThread } = useEmailThread();

  if (isDefined(error)) {
    const shouldHideMessageContent = error.graphQLErrors.some(
      (e) => e.extensions?.code === 'FORBIDDEN',
    );

    if (shouldHideMessageContent) {
      return <EventCardMessageNotShared sharedByFullName={authorFullName} />;
    }

    const shouldHandleNotFound = error.graphQLErrors.some(
      (e) => e.extensions?.code === 'NOT_FOUND',
    );

    if (shouldHandleNotFound) {
      return <div>Message not found</div>;
    }

    return <div>Error loading message</div>;
  }

  if (loading || isUndefined(message)) {
    return <div>Loading...</div>;
  }

  const messageParticipantHandles = message?.messageParticipants
    .map((participant) => participant.handle)
    .join(', ');

  return (
    <StyledEventCardMessageContainer>
      <StyledEmailContent>
        <StyledEmailTop>
          <StyledEmailTitle>
            <div>{message.subject}</div>
          </StyledEmailTitle>
          <StyledEmailParticipants>
            <OverflowingTextWithTooltip text={messageParticipantHandles} />
          </StyledEmailParticipants>
        </StyledEmailTop>
        <StyledEmailBody
          onClick={() => openEmailThread(message.messageThreadId)}
        >
          {message.text}
        </StyledEmailBody>
      </StyledEmailContent>
    </StyledEventCardMessageContainer>
  );
};
