import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useToggleScrollWrapper = (targetComponentInstanceId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ScrollWrapperComponentInstanceContext,
    targetComponentInstanceId,
  );

  const toggleScrollXWrapper = (isEnabled: boolean) => {
    if (isEnabled) {
      document
        .getElementById(`scroll-wrapper-${instanceId}`)
        ?.classList.add('scroll-wrapper-x-enabled');
    } else {
      document
        .getElementById(`scroll-wrapper-${instanceId}`)
        ?.classList.remove('scroll-wrapper-x-enabled');
    }
  };

  const toggleScrollYWrapper = (isEnabled: boolean) => {
    if (isEnabled) {
      document
        .getElementById(`scroll-wrapper-${instanceId}`)
        ?.classList.add('scroll-wrapper-y-enabled');
    } else {
      document
        .getElementById(`scroll-wrapper-${instanceId}`)
        ?.classList.remove('scroll-wrapper-y-enabled');
    }
  };

  return {
    toggleScrollXWrapper,
    toggleScrollYWrapper,
  };
};
