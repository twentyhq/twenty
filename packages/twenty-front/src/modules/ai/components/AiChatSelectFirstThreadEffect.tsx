import { useEffect } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useNavigateApp } from '~/hooks/useNavigateApp';

type AiChatSelectFirstThreadEffectProps = {
  // The channel whose list is on screen, or null on the personal inbox.
  channelId: string | null;
  firstThreadId: string | undefined;
  isThreadSelected: boolean;
};

// A list beside an empty composer reads as a dead end. Landing on the top of
// the list is what a mail client does, so the page opens on something to read
// and the composer is reached by asking for a new chat. An empty list keeps
// the composer: there is nothing else to show.
//
// The navigation replaces rather than pushes, so going back leaves the page
// instead of returning to a list that would select the same thread again.
export const AiChatSelectFirstThreadEffect = ({
  channelId,
  firstThreadId,
  isThreadSelected,
}: AiChatSelectFirstThreadEffectProps) => {
  const navigateApp = useNavigateApp();

  useEffect(() => {
    if (isThreadSelected || !isDefined(firstThreadId)) {
      return;
    }

    if (isDefined(channelId)) {
      navigateApp(
        AppPath.AiChatChannel,
        { channelId, threadId: firstThreadId },
        undefined,
        { replace: true },
      );

      return;
    }

    navigateApp(AppPath.AiChatInbox, { threadId: firstThreadId }, undefined, {
      replace: true,
    });
  }, [channelId, firstThreadId, isThreadSelected, navigateApp]);

  return null;
};
