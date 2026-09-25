import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useMountCommand } from '@/command-menu-item/engine-command/hooks/useMountCommand';
import { isPathCommandMenuItemPayload } from '@/command-menu-item/engine-command/utils/isPathCommandMenuItemPayload';
import { isEngineCommandMountedFamilySelector } from '@/command-menu-item/engine-command/selectors/isEngineCommandMountedFamilySelector';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isValidElement, useContext } from 'react';
import { ENGINE_COMPONENT_KEY_COMPONENT_MAP } from '@/command-menu-item/engine-command/constants/EngineComponentKeyHeadlessComponentMap';
import { ExportRecordsCommand } from '@/command-menu-item/engine-command/record/components/ExportRecordsCommand';
import { ContextStorePageType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

export const useCommandMenuItemClick = ({
  item,
  Icon,
  label,
}: {
  item: CommandMenuItemDefinition;
  Icon: IconComponent;
  label: string;
}) => {
  const { commandMenuContextApi } = useContext(CommandMenuContext);
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
        closeSidePanelOnCommandMenuListExecution: false,
      } as const)
    : ({} as const);

  const { closeCommandMenu } = useCloseCommandMenu(closeBehavior);

  const disabled = shouldMountCommand ? isMounted : false;

  const handleClick = async () => {
    if (shouldMountCommand) {
      if (isMounted) {
        return;
      }

      const engineComponent = isDefined(item.engineComponentKey)
        ? ENGINE_COMPONENT_KEY_COMPONENT_MAP[item.engineComponentKey]
        : undefined;
      const isIndexExport =
        isValidElement(engineComponent) &&
        engineComponent.type === ExportRecordsCommand &&
        commandMenuContextApi.pageType === ContextStorePageType.Index;
      if (!isIndexExport) {
        closeCommandMenu();
      }

      await mountCommand({
        engineCommandId: item.id,
        contextStoreInstanceId,
        engineComponentKey: item.engineComponentKey,
        frontComponentId: item.frontComponentId ?? undefined,
        workflowVersionId: item.workflowVersionId ?? undefined,
        coreWorkflowVersionId: item.coreWorkflowVersionId ?? undefined,
        availabilityType: item.availabilityType,
        availabilityObjectMetadataId: item.availabilityObjectMetadataId,
        payload:
          isDefined(item.payload) && isPathCommandMenuItemPayload(item.payload)
            ? item.payload
            : undefined,
        navigationTargetObjectMetadataId: item.navigationTargetObjectMetadataId,
        creationTargetObjectMetadataId: item.creationTargetObjectMetadataId,
        isInSidePanel: commandMenuContextApi.isInSidePanel,
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
        recordContext: isDefined(objectNameSingular)
          ? { objectNameSingular, recordId }
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
