import { useContextStoreInstanceId } from '@/context-store/hooks/useContextStoreInstanceId';
import { contextStoreCurrentCoreObjectNameComponentState } from '@/context-store/states/contextStoreCurrentCoreObjectNameComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect } from 'react';
import { type CommandMenuCoreObjectName } from 'twenty-shared/types';

type RouteContextStoreCoreObjectNameEffectProps = {
  coreObjectName: CommandMenuCoreObjectName | null;
};

export const RouteContextStoreCoreObjectNameEffect = ({
  coreObjectName,
}: RouteContextStoreCoreObjectNameEffectProps) => {
  const [
    contextStoreCurrentCoreObjectName,
    setContextStoreCurrentCoreObjectName,
  ] = useAtomComponentState(
    contextStoreCurrentCoreObjectNameComponentState,
    useContextStoreInstanceId(),
  );

  useEffect(() => {
    if (contextStoreCurrentCoreObjectName !== coreObjectName) {
      setContextStoreCurrentCoreObjectName(coreObjectName);
    }
  }, [
    contextStoreCurrentCoreObjectName,
    coreObjectName,
    setContextStoreCurrentCoreObjectName,
  ]);

  return null;
};
