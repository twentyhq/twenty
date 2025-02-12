import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

// TODO: This whole code should be removed. currentViewId should be used directly to set the mainContextStore
// and viewbar / view tooling should be updated to use that state contextStore state directly.
export const QueryParamsViewIdEffect = () => {
  const [currentViewId, setCurrentViewId] = useRecoilComponentStateV2(
    currentViewIdComponentState,
  );

  const mainContextStoreComponentInstanceId = useRecoilValue(
    mainContextStoreComponentInstanceIdState,
  );

  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    mainContextStoreComponentInstanceId,
  );

  useEffect(() => {
    if (isDefined(contextStoreCurrentViewId)) {
      if (currentViewId !== contextStoreCurrentViewId) {
        setCurrentViewId(contextStoreCurrentViewId);
      }
    }
  }, [contextStoreCurrentViewId, currentViewId, setCurrentViewId]);

  return <></>;
};
