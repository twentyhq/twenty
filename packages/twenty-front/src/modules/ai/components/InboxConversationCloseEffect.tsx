import { useStore } from 'jotai';
import { useLayoutEffect } from 'react';

import { closingInboxThreadIdState } from '@/ai/states/closingInboxThreadIdState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { resetClosingInboxThread } from '@/ai/utils/resetClosingInboxThread';

type InboxConversationCloseEffectProps = {
  isPresent: boolean;
};

export const InboxConversationCloseEffect = ({
  isPresent,
}: InboxConversationCloseEffectProps) => {
  const store = useStore();

  useLayoutEffect(() => {
    store.set(
      closingInboxThreadIdState.atom,
      isPresent ? null : store.get(currentInboxThreadState.atom),
    );
  }, [isPresent, store]);

  useLayoutEffect(() => {
    return () => resetClosingInboxThread(store);
  }, [store]);

  return null;
};
