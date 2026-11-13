import { AiChatThreadDetailsDropdown } from '@/ai/components/AiChatThreadDetailsDropdown';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { useAiChatThreadDisplayLabel } from '@/ai/hooks/useAiChatThreadDisplayLabel';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
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
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    currentAiChatThread ?? '',
  );
  const displayLabel = useAiChatThreadDisplayLabel({
    thread,
    fallbackLabel: t`Ask AI`,
  });

  return (
    <StyledContainer>
      <HeaderIdentifier title={displayLabel} />
      {isDefined(currentAiChatThread) && !isOnNewAiChatSlot && (
        <AiChatThreadDetailsDropdown threadId={currentAiChatThread} />
      )}
    </StyledContainer>
  );
};
