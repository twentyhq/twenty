import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useScrollWrapperElement = (targetComponentInstanceId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ScrollWrapperComponentInstanceContext,
    targetComponentInstanceId,
  );

  const scrollWrapperId = `scroll-wrapper-${instanceId}`;

  const element = document.getElementById(scrollWrapperId);

  return {
    scrollWrapperHTMLElement: element,
  };
};
