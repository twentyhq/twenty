import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatTab } from '@/ai/components/AiChatTab';
import { ExpandedAiChatHeader } from '@/ai/expanded-chat/components/ExpandedAiChatHeader';
import { ExpandedAiChatSidePanelHandoffEffect } from '@/ai/expanded-chat/effect-components/ExpandedAiChatSidePanelHandoffEffect';
import { selectedInboxNotificationIdState } from '@/ai/expanded-chat/states/selectedInboxNotificationIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { NotificationDetail } from '@/notification/components/NotificationDetail';
import { useInboxNotifications } from '@/notification/hooks/useInboxNotifications';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE = `calc(${themeCssVariables.border.radius.md} + ${themeCssVariables.spacing[1]})`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE} 0 0
    ${PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

const StyledConversationContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-x: clip;
  width: 100%;
`;

// The thread rail lives in the navigation drawer while this page is open
// (see ExpandedAiChatDrawerThreads); this component only renders the
// conversation column.
export const ExpandedAiChat = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadTitle = useAtomComponentFamilyStateValue(
    currentAiChatThreadTitleComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const selectedInboxNotificationId = useAtomStateValue(
    selectedInboxNotificationIdState,
  );
  const { needsAttentionNotifications, updateNotifications } =
    useInboxNotifications();

  const selectedNotification = [
    ...needsAttentionNotifications,
    ...updateNotifications,
  ].find((notification) => notification.id === selectedInboxNotificationId);

  return (
    <StyledPanel>
      <ExpandedAiChatSidePanelHandoffEffect />
      <ExpandedAiChatHeader
        title={
          selectedNotification?.title ?? currentAiChatThreadTitle ?? t`Ask AI`
        }
      />
      <StyledConversationContent>
        {selectedNotification ? (
          <NotificationDetail notification={selectedNotification} />
        ) : (
          <AiChatTab />
        )}
      </StyledConversationContent>
    </StyledPanel>
  );
};
