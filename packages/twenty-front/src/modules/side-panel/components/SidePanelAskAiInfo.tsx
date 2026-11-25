import { InboxThreadDetailsDropdown } from '@/inbox/components/InboxThreadDetailsDropdown';
import { useAiChatThreadDisplayLabel } from '@/ai-chat/threads/hooks/useAiChatThreadDisplayLabel';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { useAskAiSidePanelThreadId } from '@/side-panel/hooks/useAskAiSidePanelThreadId';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const SidePanelAskAiInfo = () => {
  const { t } = useLingui();
  const askAiSidePanelThreadId = useAskAiSidePanelThreadId();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    askAiSidePanelThreadId,
  );
  const displayLabel = useAiChatThreadDisplayLabel({
    thread,
    fallbackLabel: t`Ask AI`,
  });

  return (
    <StyledContainer>
      <HeaderIdentifier title={displayLabel} />
      {askAiSidePanelThreadId !== newAiChatThreadId && (
        <InboxThreadDetailsDropdown threadId={askAiSidePanelThreadId} />
      )}
    </StyledContainer>
  );
};
