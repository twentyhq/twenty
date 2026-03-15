import { styled } from '@linaria/react';

import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { EventCardMessageBodyNotShared } from '@/activities/timeline-activities/rows/message/components/EventCardMessageBodyNotShared';
import { EventCardMessageForbidden } from '@/activities/timeline-activities/rows/message/components/EventCardMessageForbidden';
import { useOpenEmailThreadInSidePanel } from '@/side-panel/hooks/useOpenEmailThreadInSidePanel';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { Trans, useLingui } from '@lingui/react/macro';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEventCardMessageContainer = styled.div<{ canOpen?: boolean }>`
  cursor: ${({ canOpen }) => (canOpen ? 'pointer' : 'not-allowed')};
  display: flex;
  flex-direction: column;
  width: 380px;
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
  const { t } = useLingui();
  const { openEmailThreadInSidePanel } = useOpenEmailThreadInSidePanel();

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
      const shouldHideMessageContent = error.errors.some(
        (e) => e.extensions?.code === 'FORBIDDEN',
      );

      if (shouldHideMessageContent) {
        return (
          <EventCardMessageForbidden notSharedByFullName={authorFullName} />
        );
      }

      const shouldHandleNotFound = error.errors.some(
        (e) => e.extensions?.code === 'NOT_FOUND',
      );

      if (shouldHandleNotFound) {
        return (
          <div>
            <Trans>Message not found</Trans>
          </div>
        );
      }
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
      openEmailThreadInSidePanel(message.messageThreadId);
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
