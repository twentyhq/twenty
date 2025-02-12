import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared';

// TODO: This whole code should be removed. currentViewId should be used directly to set the mainContextStore
// and viewbar / view tooling should be updated to use that state contextStore state directly.
export const QueryParamsViewIdEffect = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const [currentViewId, setCurrentViewId] = useRecoilComponentStateV2(
    currentViewIdComponentState,
  );

  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
    objectNamePlural,
  );

  useEffect(() => {
    if (isDefined(contextStoreCurrentViewId)) {
      if (currentViewId !== contextStoreCurrentViewId) {
        console.log('setting currentViewId', contextStoreCurrentViewId);
        setCurrentViewId(contextStoreCurrentViewId);
      }
    }
  }, [contextStoreCurrentViewId, currentViewId, setCurrentViewId]);

  return <></>;
};
