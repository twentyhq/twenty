import { useAiChatThreadDisplayLabel } from '@/ai-chat/threads/hooks/useAiChatThreadDisplayLabel';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { useAskAiSidePanelThreadId } from '@/side-panel/hooks/useAskAiSidePanelThreadId';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useLingui } from '@lingui/react/macro';

export const SidePanelAskAiInfo = () => {
  const { t } = useLingui();
  const askAiSidePanelThreadId = useAskAiSidePanelThreadId();
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    askAiSidePanelThreadId,
  );
  const displayLabel = useAiChatThreadDisplayLabel({
    thread,
    fallbackLabel: t`Ask AI`,
  });

  return <HeaderIdentifier title={displayLabel} />;
};
