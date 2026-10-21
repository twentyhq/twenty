import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
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
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const currentAiChatThreadTitle = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    currentAiChatThread ?? '',
  )?.title;

  return (
    <StyledContainer>
      <HeaderIdentifier title={currentAiChatThreadTitle ?? t`Ask AI`} />
      {isDefined(currentAiChatThread) && !isOnNewAiChatSlot && (
        <AiChatThreadDetailsDropdown threadId={currentAiChatThread} />
      )}
    </StyledContainer>
  );
};
