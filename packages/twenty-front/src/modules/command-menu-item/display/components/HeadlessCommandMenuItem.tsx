import { useContext } from 'react';

import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { useMountCommand } from '@/command-menu-item/engine-command/hooks/useMountCommand';
import { isEngineCommandMountedFamilySelector } from '@/command-menu-item/engine-command/selectors/isEngineCommandMountedFamilySelector';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

import { CommandMenuItemDisplay } from './CommandMenuItemDisplay';

export const HeadlessCommandMenuItem = ({
  item,
}: {
  item: CommandMenuItemFieldsFragment;
}) => {
  const commandMenuItemConfig = useContext(CommandConfigContext);
  const mountCommand = useMountCommand();

  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

  const isMounted = useAtomFamilySelectorValue(
    isEngineCommandMountedFamilySelector,
    item.id,
  );

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsExecution: false,
    closeSidePanelOnCommandMenuListExecution: false,
  });

  const commandMenuItemProgress = useAtomFamilyStateValue(
    commandMenuItemProgressFamilyState,
    item.id,
  );

  if (!isDefined(commandMenuItemConfig)) {
    return null;
  }

  const handleClick = async () => {
    if (isMounted) {
      return;
    }

    closeCommandMenu();

    await mountCommand({
      engineCommandId: item.id,
      contextStoreInstanceId,
      engineComponentKey: item.engineComponentKey,
      frontComponentId: item.frontComponentId ?? undefined,
      workflowVersionId: item.workflowVersionId ?? undefined,
      availabilityType: item.availabilityType,
      availabilityObjectMetadataId: item.availabilityObjectMetadataId,
    });
  };

  return (
    <CommandMenuItemDisplay
      onClick={handleClick}
      disabled={isMounted}
      progress={commandMenuItemProgress}
      showDisabledLoader={isMounted}
    />
  );
};
