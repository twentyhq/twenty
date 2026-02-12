import styled from '@emotion/styled';

import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { EventCardMessageBodyNotShared } from '@/activities/timeline-activities/rows/message/components/EventCardMessageBodyNotShared';
import { EventCardMessageForbidden } from '@/activities/timeline-activities/rows/message/components/EventCardMessageForbidden';
import { useOpenEmailThreadInCommandMenu } from '@/command-menu/hooks/useOpenEmailThreadInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { Trans, useLingui } from '@lingui/react/macro';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledEventCardMessageContainer = styled.div<{ canOpen?: boolean }>`
  cursor: ${({ canOpen }) => (canOpen ? 'pointer' : 'not-allowed')};
  display: flex;
  flex-direction: column;
  width: 380px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmailParticipants = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledEmailBody = styled.div`
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EventCardMessage = ({
  messageId,
  authorFullName,
}: {
  messageId: string;
  authorFullName: string;
}) => {
  const { t } = useLingui();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { openEmailThreadInCommandMenu } = useOpenEmailThreadInCommandMenu();

  const {
    record: message,
    loading,
    error,
  } = useFindOneRecord<EmailThreadMessage>({
    objectNameSingular: CoreObjectNameSingular.Message,
    objectRecordId: messageId,
    recordGqlFields: {
      id: true,
      text: true,
      subject: true,
      direction: true,
      messageThreadId: true,
      messageParticipants: {
        handle: true,
      },
    },
    onCompleted: (data) => {
      upsertRecordsInStore({ partialRecords: [data] });
    },
  });

  if (isDefined(error)) {
    const shouldHideMessageContent = error.graphQLErrors.some(
      (e) => e.extensions?.code === 'FORBIDDEN',
    );

    if (shouldHideMessageContent) {
      return <EventCardMessageForbidden notSharedByFullName={authorFullName} />;
    }

    const shouldHandleNotFound = error.graphQLErrors.some(
      (e) => e.extensions?.code === 'NOT_FOUND',
    );

    if (shouldHandleNotFound) {
      return (
        <div>
          <Trans>Message not found</Trans>
        </div>
      );
    }

    return (
      <div>
        <Trans>Error loading message</Trans>
      </div>
    );
  }

  if (loading || !isDefined(message)) {
    return (
      <div>
        <Trans>Loading...</Trans>
      </div>
    );
  }

  const messageParticipantHandles = message.messageParticipants
    .map((participant) => participant.handle)
    .filter((handle) => isDefined(handle) && handle !== '')
    .join(', ');

  const canOpen =
    message.subject !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

  const handleClick = () => {
    if (canOpen && isDefined(message.messageThreadId)) {
      openEmailThreadInCommandMenu(message.messageThreadId);
    }
  };

  return (
    <StyledEventCardMessageContainer canOpen={canOpen} onClick={handleClick}>
      <StyledEmailContent>
        <StyledEmailTop>
          <StyledEmailTitle>
            {message.subject !==
            FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED
              ? message.subject
              : t`Subject not shared`}
          </StyledEmailTitle>
          <StyledEmailParticipants>
            <OverflowingTextWithTooltip text={messageParticipantHandles} />
          </StyledEmailParticipants>
        </StyledEmailTop>
        {message.text !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED ? (
          <StyledEmailBody>{message.text}</StyledEmailBody>
        ) : (
          <EventCardMessageBodyNotShared notSharedByFullName={authorFullName} />
        )}
      </StyledEmailContent>
    </StyledEventCardMessageContainer>
  );
};
