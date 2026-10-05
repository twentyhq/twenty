import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const SidePanelAskAiInfo = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadTitle = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    currentAiChatThread ?? '',
  )?.title;

  return (
    <StyledContainer>
      <HeaderIdentifier title={currentAiChatThreadTitle ?? t`Ask AI`} />
      {isDefined(currentAiChatThread) &&
        currentAiChatThread !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY && (
          <AiChatThreadDetailsDropdown threadId={currentAiChatThread} />
        )}
    </StyledContainer>
  );
};
