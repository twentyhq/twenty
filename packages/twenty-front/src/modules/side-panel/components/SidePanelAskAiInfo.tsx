import { AiChatThreadRecordTargets } from '@/ai/components/AiChatThreadRecordTargets';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
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
  const currentAiChatThreadTitle = useAtomComponentFamilyStateValue(
    currentAiChatThreadTitleComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const currentAiChatThreadData = useAtomStateValue(
    currentAiChatThreadDataSelector,
  );

  return (
    <StyledContainer>
      <HeaderIdentifier title={currentAiChatThreadTitle ?? t`Ask AI`} />
      {isDefined(currentAiChatThreadData) && (
        <AiChatThreadRecordTargets
          threadId={currentAiChatThreadData.id}
          instanceId="side-panel-ask-ai-thread-record-targets"
        />
      )}
    </StyledContainer>
  );
};
