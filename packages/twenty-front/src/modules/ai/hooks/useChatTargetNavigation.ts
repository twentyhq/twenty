import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

// The single place deciding where a target surfaced from the chat lands.
// On the chat page the conversation keeps the main pane: records open in
// the side panel; targets without a side panel surface navigate the
// workspace, with the conversation following in the side panel.
export const useChatTargetNavigation = () => {
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const openRecordTarget = ({
    recordId,
    objectNameSingular,
  }: {
    recordId: string;
    objectNameSingular: string;
  }) => {
    if (isCurrentPathAiChatPage()) {
      openRecordInSidePanel({
        recordId,
        objectNameSingular,
      });

      return;
    }

    navigateApp(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: recordId,
    });
  };

  const navigateFromChat: typeof navigateApp = (
    to,
    params,
    queryParams,
    options,
  ) => {
    if (isCurrentPathAiChatPage()) {
      openAskAiPage({ resetNavigationStack: true, force: true });
    }

    return navigateApp(to, params, queryParams, options);
  };

  return { openRecordTarget, navigateFromChat };
};
