import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useLayoutEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const useAgentChatScrollToBottom = ({
  messages,
  scrollWrapperId,
}: {
  scrollWrapperId: string;
  messages: ExtendedUIMessage[];
}) => {
  const { scrollWrapperHTMLElement } =
    useScrollWrapperHTMLElement(scrollWrapperId);

  const currentAIChatThread = useRecoilValue(currentAIChatThreadState);

  useLayoutEffect(() => {
    if (!isDefined(scrollWrapperHTMLElement)) {
      return;
    }

    scrollWrapperHTMLElement.scrollTo({
      top: scrollWrapperHTMLElement.scrollHeight,
      behavior: 'smooth',
    });
  }, [scrollWrapperHTMLElement, currentAIChatThread, messages]);
};
