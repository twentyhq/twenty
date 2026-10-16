import { useMemo } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useAtomComponentStateCallbackState = <StateType>(
  componentState: ComponentState<StateType>,
  instanceIdFromProps?: string,
): ReturnType<ComponentState<StateType>['atomFamily']> => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentState.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      doNotTranslate(
        `Instance context for key "${componentState.key}" is not defined`,
      ),
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  return useMemo(
    () => componentState.atomFamily({ instanceId }),
    [componentState, instanceId],
  );
};
