import { isEngineCommandMountedFamilySelector } from '@/command-menu-item/engine-command/selectors/isEngineCommandMountedFamilySelector';
import { useMountEngineCommand } from '@/command-menu-item/engine-command/hooks/useMountEngineCommand';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

import { HeadlessCommandMenuItem } from './HeadlessCommandMenuItem';

export const EngineCommandMenuItem = ({
  commandMenuItemId,
  engineComponentKey,
}: {
  commandMenuItemId: string;
  engineComponentKey: EngineComponentKey;
}) => {
  const mountEngineCommand = useMountEngineCommand();

  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

  const isMounted = useAtomFamilySelectorValue(
    isEngineCommandMountedFamilySelector,
    commandMenuItemId,
  );

  const handleClick = () => {
    mountEngineCommand(
      commandMenuItemId,
      contextStoreInstanceId,
      engineComponentKey,
    );
  };

  return (
    <HeadlessCommandMenuItem
      isMounted={isMounted}
      commandMenuItemId={commandMenuItemId}
      onClick={handleClick}
    />
  );
};
