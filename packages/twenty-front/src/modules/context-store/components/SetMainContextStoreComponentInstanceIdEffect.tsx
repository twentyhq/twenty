import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useContext, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const SetMainContextStoreComponentInstanceIdEffect = () => {
  const setMainContextStoreComponentInstanceId = useSetRecoilState(
    mainContextStoreComponentInstanceIdState,
  );

  const context = useContext(ContextStoreComponentInstanceContext);

  useEffect(() => {
    setMainContextStoreComponentInstanceId(context?.instanceId ?? null);

    return () => {
      setMainContextStoreComponentInstanceId(null);
    };
  }, [context, setMainContextStoreComponentInstanceId]);

  return null;
};
