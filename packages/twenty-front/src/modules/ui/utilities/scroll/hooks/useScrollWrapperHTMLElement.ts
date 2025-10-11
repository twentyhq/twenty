import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useHTMLElementByIdWhenAvailable } from '~/hooks/useHTMLElementByIdWhenAvailable';

export const useScrollWrapperHTMLElement = (
  targetComponentInstanceId?: string,
) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ScrollWrapperComponentInstanceContext,
    targetComponentInstanceId,
  );

  const scrollWrapperId = `scroll-wrapper-${instanceId}`;

  const { element: scrollWrapperHTMLElement } =
    useHTMLElementByIdWhenAvailable(scrollWrapperId);

  const getScrollWrapperElement = () => {
    const scrollWrapperElement = document.getElementById(scrollWrapperId);

    return {
      scrollWrapperElement,
    };
  };

  return {
    scrollWrapperHTMLElement,
    getScrollWrapperElement,
  };
};
