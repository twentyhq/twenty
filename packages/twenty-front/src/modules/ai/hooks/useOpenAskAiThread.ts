import { useInboxThreadClick } from '@/ai/hooks/useInboxThreadClick';
import { useSelectInboxThread } from '@/ai/hooks/useSelectInboxThread';
import { inboxSelectedThreadListSourceState } from '@/ai/states/inboxSelectedThreadListSourceState';
import { inboxThreadListThreadsFamilySelector } from '@/ai/states/selectors/inboxThreadListThreadsFamilySelector';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const useOpenAskAiThread = () => {
  const inboxSelectedThreadListSource = useAtomStateValue(
    inboxSelectedThreadListSourceState,
  );
  const inboxThreadListThreads = useAtomFamilySelectorValue(
    inboxThreadListThreadsFamilySelector,
    inboxSelectedThreadListSource,
  );
  const { selectInboxThread } = useSelectInboxThread();

  const { handleThreadClick } = useInboxThreadClick({
    resetNavigationStack: true,
  });
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const openAskAiThread = (threadId: string) => {
    const thread = inboxThreadListThreads.find(
      (visibleThread) => visibleThread.id === threadId,
    );

    if (isDefined(thread)) {
      handleThreadClick(thread);
      return;
    }

    if (isValidUuid(threadId)) {
      selectInboxThread(threadId);
    }

    openAskAiPage({ resetNavigationStack: true });
  };

  return { openAskAiThread };
};
