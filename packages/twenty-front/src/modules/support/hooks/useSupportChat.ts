import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useScriptLoader } from '~/hooks/useScriptLoader';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSupportChat = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const supportChat = useRecoilValue(supportChatState);
  const [isFrontChatLoaded, setIsFrontChatLoaded] = useState(false);
  const [shouldLoadScript, setShouldLoadScript] = useState(false);
  const loading = useIsPrefetchLoading();

  const shouldConfigureFront =
    supportChat?.supportDriver === 'FRONT' &&
    isNonEmptyString(supportChat.supportFrontChatId) &&
    isNonEmptyString(currentUser?.email) &&
    isDefined(currentWorkspaceMember);

  const handleLoad = useCallback(() => {
    if (!shouldConfigureFront) {
      return;
    }

    window.FrontChat?.('init', {
      chatId: supportChat.supportFrontChatId as string,
      useDefaultLauncher: false,
      email: currentUser.email,
      name:
        currentWorkspaceMember!.name.firstName +
        ' ' +
        currentWorkspaceMember!.name.lastName,
      userHash: currentUser?.supportUserHash,
    });
    setIsFrontChatLoaded(true);
  }, [
    shouldConfigureFront,
    supportChat.supportFrontChatId,
    currentUser,
    currentWorkspaceMember,
  ]);

  useEffect(() => {
    if (shouldConfigureFront && !isFrontChatLoaded) {
      const timeout = setTimeout(() => setShouldLoadScript(true), 500);

      return () => clearTimeout(timeout);
    }

    if (!shouldConfigureFront) {
      setShouldLoadScript(false);
      setIsFrontChatLoaded(false);
    }
  }, [shouldConfigureFront, isFrontChatLoaded]);

  useScriptLoader({
    src: shouldLoadScript
      ? 'https://chat-assets.frontapp.com/v1/chat.bundle.js'
      : null,
    onLoad: handleLoad,
    attributes: { defer: true },
  });

  return { loading, isFrontChatLoaded };
};
