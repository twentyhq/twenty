import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';

export const SidePanelAskAiInfo = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadTitle = useAtomComponentFamilyStateValue(
    currentAiChatThreadTitleComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  return <HeaderIdentifier title={currentAiChatThreadTitle ?? t`Ask AI`} />;
};
