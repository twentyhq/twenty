import { useStore } from 'jotai';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useMountCommand } from '@/command-menu-item/engine-command/hooks/useMountCommand';
import { isEngineCommandMountedFamilySelector } from '@/command-menu-item/engine-command/selectors/isEngineCommandMountedFamilySelector';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { waitForSidePanelClose } from '@/ui/layout/side-panel/utils/waitForSidePanelClose';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const useCommandMenuItemClick = ({
  item,
  Icon,
  label,
}: {
  item: CommandMenuItemFieldsFragment;
  Icon: IconComponent;
  label: string;
}) => {
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const store = useStore();
  const mountCommand = useMountCommand();
  const { openFrontComponentInSidePanel } = useOpenFrontComponentInSidePanel();

  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

  const isMounted = useAtomFamilySelectorValue(
    isEngineCommandMountedFamilySelector,
    item.id,
  );

  const commandMenuItemProgress = useAtomFamilyStateValue(
    commandMenuItemProgressFamilyState,
    item.id,
  );

  const isHeadless =
    isDefined(item.frontComponentId) &&
    item.frontComponent?.isHeadless === true;

  const isEngineCommand =
    isDefined(item.engineComponentKey) && !isDefined(item.frontComponentId);

  const isFrontComponent =
    isDefined(item.frontComponentId) &&
    item.frontComponent?.isHeadless !== true;

  const shouldMountCommand = isHeadless || isEngineCommand;

  const closeBehavior = shouldMountCommand
    ? ({
        closeSidePanelOnShowPageOptionsExecution: false,
        closeSidePanelOnCommandMenuListExecution: !item.isPinned,
      } as const)
    : ({} as const);

  const { closeCommandMenu } = useCloseCommandMenu(closeBehavior);

  const disabled = shouldMountCommand ? isMounted : false;

  const handleClick = async () => {
    if (shouldMountCommand) {
      if (isMounted) {
        return;
      }

      closeCommandMenu();

      if (!item.isPinned && store.get(isSidePanelClosingState.atom)) {
        await waitForSidePanelClose();
      }

      await mountCommand({
        engineCommandId: item.id,
        contextStoreInstanceId,
        engineComponentKey: item.engineComponentKey,
        frontComponentId: item.frontComponentId ?? undefined,
        workflowVersionId: item.workflowVersionId ?? undefined,
        availabilityType: item.availabilityType,
        availabilityObjectMetadataId: item.availabilityObjectMetadataId,
        payload: item.payload ?? undefined,
      });

      return;
    }

    if (isFrontComponent && isDefined(item.frontComponentId)) {
      const { selectedRecords, objectMetadataItem } = commandMenuContextApi;

      const recordId =
        selectedRecords.length === 1 ? selectedRecords[0].id : undefined;

      const objectNameSingular = objectMetadataItem.nameSingular as
        | string
        | undefined;

      closeCommandMenu();

      openFrontComponentInSidePanel({
        frontComponentId: item.frontComponentId,
        pageTitle: label,
        pageIcon: Icon,
        recordContext:
          isDefined(recordId) && isDefined(objectNameSingular)
            ? { recordId, objectNameSingular }
            : undefined,
      });
    }
  };

  return {
    handleClick,
    disabled,
    progress: shouldMountCommand ? commandMenuItemProgress : undefined,
    showDisabledLoader: shouldMountCommand ? isMounted : false,
  };
};
