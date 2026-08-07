import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { NotificationType } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconBell,
  IconMessage,
  IconSparkles,
} from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { selectedInboxNotificationIdState } from '@/ai/expanded-chat/states/selectedInboxNotificationIdState';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { useIsNotificationObjectAvailable } from '@/notification/hooks/useIsNotificationObjectAvailable';
import { useInboxNotifications } from '@/notification/hooks/useInboxNotifications';
import { useNotificationActions } from '@/notification/hooks/useNotificationActions';
import { type Notification } from '@/notification/types/Notification';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledSections = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  max-height: 50%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]} 0;
`;

const StyledNotificationRow = styled.button`
  align-items: flex-start;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledNotificationBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.span<{ isUnread: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isUnread }) =>
    isUnread
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTime = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  margin-left: auto;
`;

const StyledPreview = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledUnreadDot = styled.span`
  background: ${themeCssVariables.color.blue};
  border-radius: 50%;
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

const StyledIconContainer = styled.div<{ isAlert: boolean }>`
  align-items: center;
  color: ${({ isAlert }) =>
    isAlert
      ? themeCssVariables.color.orange
      : themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  padding-top: 2px;
`;

const getNotificationIcon = (notificationType: string) => {
  if (notificationType === NotificationType.WorkflowRunFailed) {
    return IconAlertTriangle;
  }
  if (
    notificationType === NotificationType.AgentQuestion ||
    notificationType === NotificationType.ApprovalRequest
  ) {
    return IconSparkles;
  }
  if (notificationType === NotificationType.ThreadReply) {
    return IconMessage;
  }
  return IconBell;
};

const InboxNotificationRow = ({
  notification,
}: {
  notification: Notification;
}) => {
  const { theme } = useContext(ThemeContext);
  const setSelectedInboxNotificationId = useSetAtomState(
    selectedInboxNotificationIdState,
  );
  const agentChatVisibleThreads = useAtomStateValue(
    agentChatVisibleThreadsSelector,
  );
  const { handleThreadClick } = useAiChatThreadClick();
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { markNotificationRead } = useNotificationActions();

  const isUnread = notification.status === 'UNREAD';
  const Icon = getNotificationIcon(notification.type);

  const handleClick = () => {
    if (isUnread) {
      void markNotificationRead(notification.id);
    }

    if (isNonEmptyString(notification.threadId)) {
      const linkedThread = agentChatVisibleThreads.find(
        (thread) => thread.id === notification.threadId,
      );

      setSelectedInboxNotificationId(null);

      if (linkedThread) {
        // Initializes thread title and usage state like any thread click.
        handleThreadClick(linkedThread);
        return;
      }

      switchThreadWithDraft(notification.threadId);
      return;
    }

    setSelectedInboxNotificationId(notification.id);
  };

  return (
    <StyledNotificationRow onClick={handleClick}>
      <StyledIconContainer isAlert={notification.requiresAction}>
        <Icon size={theme.icon.size.sm} />
      </StyledIconContainer>
      <StyledNotificationBody>
        <StyledTitleRow>
          {isUnread && <StyledUnreadDot />}
          <StyledTitle isUnread={isUnread}>{notification.title}</StyledTitle>
          <StyledTime>
            {beautifyPastDateRelativeToNow(notification.createdAt)}
          </StyledTime>
        </StyledTitleRow>
        {isNonEmptyString(notification.preview) && (
          <StyledPreview>{notification.preview}</StyledPreview>
        )}
      </StyledNotificationBody>
    </StyledNotificationRow>
  );
};

const InboxNotificationsSectionsContent = () => {
  const { t } = useLingui();
  const { needsAttentionNotifications, updateNotifications } =
    useInboxNotifications();

  if (
    needsAttentionNotifications.length === 0 &&
    updateNotifications.length === 0
  ) {
    return null;
  }

  return (
    <StyledSections>
      {needsAttentionNotifications.length > 0 && (
        <>
          <NavigationDrawerSectionTitle label={t`Needs attention`} />
          {needsAttentionNotifications.map((notification) => (
            <InboxNotificationRow
              key={notification.id}
              notification={notification}
            />
          ))}
        </>
      )}
      {updateNotifications.length > 0 && (
        <>
          <NavigationDrawerSectionTitle label={t`Updates`} />
          {updateNotifications.map((notification) => (
            <InboxNotificationRow
              key={notification.id}
              notification={notification}
            />
          ))}
        </>
      )}
    </StyledSections>
  );
};

// The availability shell keeps the query components from mounting (and
// resolving missing object metadata) before the notification object has
// synced to the workspace.
export const InboxNotificationsSections = () => {
  const isNotificationObjectAvailable = useIsNotificationObjectAvailable();

  if (!isNotificationObjectAvailable) {
    return null;
  }

  return <InboxNotificationsSectionsContent />;
};
