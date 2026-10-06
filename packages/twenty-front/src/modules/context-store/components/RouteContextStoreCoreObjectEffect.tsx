import { useEffect } from 'react';

import { contextStoreCurrentCoreObjectNameSingularComponentState } from '@/context-store/states/contextStoreCurrentCoreObjectNameSingularComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

type RouteContextStoreCoreObjectEffectProps = {
  coreObjectNameSingular?: string;
};

export const RouteContextStoreCoreObjectEffect = ({
  coreObjectNameSingular,
}: RouteContextStoreCoreObjectEffectProps) => {
  const [
    contextStoreCurrentCoreObjectNameSingular,
    setContextStoreCurrentCoreObjectNameSingular,
  ] = useAtomComponentState(
    contextStoreCurrentCoreObjectNameSingularComponentState,
  );

  useEffect(() => {
    if (contextStoreCurrentCoreObjectNameSingular !== coreObjectNameSingular) {
      setContextStoreCurrentCoreObjectNameSingular(coreObjectNameSingular);
    }
  }, [
    contextStoreCurrentCoreObjectNameSingular,
    coreObjectNameSingular,
    setContextStoreCurrentCoreObjectNameSingular,
  ]);

  return null;
};
