import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isFieldValueRestricted } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { EventCardMessageForbidden } from '@/activities/timeline-activities/rows/message/components/EventCardMessageForbidden';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

const StyledEventCardMessageContainer = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  max-width: 380px;
  width: 100%;
`;

const StyledEmailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: center;
`;

const StyledEmailTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEmailTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmailParticipants = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
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
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

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
  });

  if (isDefined(error)) {
    if (CombinedGraphQLErrors.is(error)) {
      if (
        error.errors.some(
          (graphQLError) => graphQLError.extensions?.code === 'FORBIDDEN',
        )
      ) {
        return (
          <EventCardMessageForbidden notSharedByFullName={authorFullName} />
        );
      }

      if (
        error.errors.some(
          (graphQLError) => graphQLError.extensions?.code === 'NOT_FOUND',
        )
      ) {
        return <Trans>Message not found</Trans>;
      }
    }

    return <Trans>Error loading message</Trans>;
  }

  if (loading) {
    return <Trans>Loading...</Trans>;
  }

  if (!isDefined(message)) {
    return <EventCardMessageForbidden notSharedByFullName={authorFullName} />;
  }

  if ([message.subject, message.text].some(isFieldValueRestricted)) {
    return <EventCardMessageForbidden notSharedByFullName={authorFullName} />;
  }

  const participantHandles = message.messageParticipants
    .map((participant) => participant.handle)
    .filter((handle) => isDefined(handle) && handle !== '')
    .join(', ');

  const handleClick = () => {
    if (isDefined(message.messageThreadId)) {
      openRecordInSidePanel({
        recordId: message.messageThreadId,
        objectNameSingular: CoreObjectNameSingular.MessageThread,
      });
    }
  };

  return (
    <StyledEventCardMessageContainer onClick={handleClick}>
      <StyledEmailContent>
        <StyledEmailTop>
          <StyledEmailTitle>{message.subject}</StyledEmailTitle>
          <StyledEmailParticipants>
            <OverflowingTextWithTooltip text={participantHandles} />
          </StyledEmailParticipants>
        </StyledEmailTop>
        <StyledEmailBody>{message.text}</StyledEmailBody>
      </StyledEmailContent>
    </StyledEventCardMessageContainer>
  );
};
