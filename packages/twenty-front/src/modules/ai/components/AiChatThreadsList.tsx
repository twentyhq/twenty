import { styled } from '@linaria/react';

import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AiChatThreadsListFallback } from '@/ai/components/AiChatThreadsListFallback';
import { AiChatThreadsListFocusEffect } from '@/ai/components/AiChatThreadsListFocusEffect';
import { AI_CHAT_THREADS_LIST_FOCUS_ID } from '@/ai/constants/AiChatThreadsListFocusId';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { InboxList } from '@/inbox/components/InboxList';
import { useInboxItems } from '@/inbox/hooks/useInboxItems';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getOsControlSymbol } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledThreadsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledButtonsContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

export const AiChatThreadsList = () => {
  const { switchToNewChat } = useSwitchToNewAiChat();

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => switchToNewChat(),
    focusId: AI_CHAT_THREADS_LIST_FOCUS_ID,
    dependencies: [switchToNewChat],
  });

  const { needsActionItems, otherItems, loading, error } = useInboxItems();

  return (
    <>
      <AiChatThreadsListFocusEffect focusId={AI_CHAT_THREADS_LIST_FOCUS_ID} />
      <StyledContainer>
        <StyledThreadsContainer>
          {isDefined(error) ? (
            <AiChatThreadsListFallback />
          ) : (
            <InboxList
              loading={loading}
              needsActionItems={needsActionItems}
              otherItems={otherItems}
            />
          )}
        </StyledThreadsContainer>
        <StyledButtonsContainer>
          <Button
            variant="primary"
            accent="blue"
            size="medium"
            title={t`New chat`}
            onClick={() => switchToNewChat()}
            hotkeys={[getOsControlSymbol(), '⏎']}
          />
        </StyledButtonsContainer>
      </StyledContainer>
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
      />
    </>
  );
};
