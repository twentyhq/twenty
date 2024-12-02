import { CONTEXT_STORE_INSTANCE_ID_DEFAULT_VALUE } from '@/context-store/constants/ContextStoreInstanceIdDefaultValue';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useContext, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const MainContextStoreComponentInstanceIdSetterEffect = () => {
  const setMainContextStoreComponentInstanceId = useSetRecoilState(
    mainContextStoreComponentInstanceIdState,
  );

  const context = useContext(ContextStoreComponentInstanceContext);

  useEffect(() => {
    setMainContextStoreComponentInstanceId(
      context?.instanceId ?? CONTEXT_STORE_INSTANCE_ID_DEFAULT_VALUE,
    );

    return () => {
      setMainContextStoreComponentInstanceId(
        CONTEXT_STORE_INSTANCE_ID_DEFAULT_VALUE,
      );
    };
  }, [context, setMainContextStoreComponentInstanceId]);

  return null;
};
