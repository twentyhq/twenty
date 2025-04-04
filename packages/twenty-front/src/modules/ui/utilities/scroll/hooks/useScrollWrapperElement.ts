import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useScrollWrapperElement = (targetComponentInstanceId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ScrollWrapperComponentInstanceContext,
    targetComponentInstanceId,
  );

  const scrollWrapperHTMLElement = document.getElementById(
    `scroll-wrapper-${instanceId}`,
  );

  return {
    scrollWrapperHTMLElement,
  };
};
