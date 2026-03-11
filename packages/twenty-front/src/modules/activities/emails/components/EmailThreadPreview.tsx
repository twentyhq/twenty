import { styled } from '@linaria/react';

import { ActivityRow } from '@/activities/components/ActivityRow';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { useOpenEmailThreadInSidePanel } from '@/side-panel/hooks/useOpenEmailThreadInSidePanel';
import { useContext } from 'react';

import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  MessageChannelVisibility,
  type TimelineThread,
} from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const StyledHeading = styled.div<{ unread: boolean }>`
  display: flex;
  max-width: 20%;
  overflow: hidden;
  width: fit-content;
`;

const StyledParticipantsContainer = styled.div`
  align-items: flex-start;
  display: flex;
`;

const StyledAvatarWrapper = styled.div`
  margin-left: calc(-1 * ${themeCssVariables.spacing[1]});
`;

const StyledSenderNames = styled.span`
  display: flex;
  margin: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledThreadCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledSubjectAndBody = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  overflow: hidden;
`;

const StyledSubject = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBody = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledReceivedAt = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
`;

type EmailThreadPreviewProps = {
  thread: TimelineThread;
};

export const EmailThreadPreview = ({ thread }: EmailThreadPreviewProps) => {
  const { theme } = useContext(ThemeContext);
  const { openEmailThreadInSidePanel } = useOpenEmailThreadInSidePanel();

  const visibility = thread.visibility;

  const senderNames =
    thread.firstParticipant.displayName +
    (thread?.lastTwoParticipants?.[0]?.displayName
      ? `, ${thread.lastTwoParticipants?.[0]?.displayName}`
      : '') +
    (thread?.lastTwoParticipants?.[1]?.displayName
      ? `, ${thread.lastTwoParticipants?.[1]?.displayName}`
      : '');

  const [finalDisplayedName, finalAvatarUrl, isCountIcon] =
    thread.participantCount > 3
      ? [`${thread.participantCount}`, '', true]
      : [
          thread?.lastTwoParticipants?.[1]?.displayName,
          thread?.lastTwoParticipants?.[1]?.avatarUrl,
          false,
        ];

  const handleThreadClick = () => {
    const canOpen =
      thread.visibility === MessageChannelVisibility.SHARE_EVERYTHING;

    if (canOpen) {
      openEmailThreadInSidePanel(thread.id);
    }
  };

  const isDisabled = visibility !== MessageChannelVisibility.SHARE_EVERYTHING;
  return (
    <ActivityRow onClick={handleThreadClick} disabled={isDisabled}>
      <StyledHeading unread={!thread.read}>
        <StyledParticipantsContainer>
          <Avatar
            avatarUrl={thread?.firstParticipant?.avatarUrl}
            placeholder={thread.firstParticipant.displayName}
            placeholderColorSeed={
              thread.firstParticipant.workspaceMemberId ||
              thread.firstParticipant.personId
            }
            type="rounded"
          />
          {isDefined(thread?.lastTwoParticipants?.[0]) && (
            <StyledAvatarWrapper>
              <Avatar
                avatarUrl={thread.lastTwoParticipants[0].avatarUrl}
                placeholder={thread.lastTwoParticipants[0].displayName}
                placeholderColorSeed={
                  thread.lastTwoParticipants[0].workspaceMemberId ||
                  thread.lastTwoParticipants[0].personId
                }
                type="rounded"
              />
            </StyledAvatarWrapper>
          )}
          {finalDisplayedName && (
            <StyledAvatarWrapper>
              <Avatar
                avatarUrl={finalAvatarUrl}
                placeholder={finalDisplayedName}
                type="rounded"
                color={isCountIcon ? theme.grayScale.gray11 : undefined}
                backgroundColor={
                  isCountIcon ? theme.grayScale.gray2 : undefined
                }
              />
            </StyledAvatarWrapper>
          )}
        </StyledParticipantsContainer>

        <StyledSenderNames>{senderNames}</StyledSenderNames>
        <StyledThreadCount>{thread.numberOfMessagesInThread}</StyledThreadCount>
      </StyledHeading>

      <StyledSubjectAndBody>
        {visibility === MessageChannelVisibility.METADATA && (
          <EmailThreadNotShared visibility={visibility} />
        )}
        {visibility === MessageChannelVisibility.SUBJECT && (
          <>
            <StyledSubject>{thread.subject}</StyledSubject>
            <EmailThreadNotShared visibility={visibility} />
          </>
        )}
        {visibility === MessageChannelVisibility.SHARE_EVERYTHING && (
          <>
            <StyledSubject>{thread.subject}</StyledSubject>
            <StyledBody>{thread.lastMessageBody}</StyledBody>
          </>
        )}
      </StyledSubjectAndBody>
      <StyledReceivedAt>
        {formatToHumanReadableDate(thread.lastMessageReceivedAt)}
      </StyledReceivedAt>
    </ActivityRow>
  );
};
