import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuContextApi } from '@/command-menu-item/server-items/common/hooks/useCommandMenuContextApi';

import { CommandMenuContextProviderServerItemsContent } from './CommandMenuContextProviderServerItemsContent';
import { CommandMenuContextProviderServerItemsWithWorkflowEnrichment } from './CommandMenuContextProviderServerItemsWithWorkflowEnrichment';

type CommandMenuContextProviderServerItemsProps = {
  isInSidePanel: CommandMenuContextType['isInSidePanel'];
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
};

export const CommandMenuContextProviderServerItems = ({
  isInSidePanel,
  displayType,
  containerType,
  children,
}: CommandMenuContextProviderServerItemsProps) => {
  const commandMenuContextApiFromHook = useCommandMenuContextApi();

  // SidePanelRecordPage shadows the outer ContextStore provider with a
  // per-page instance ID, so useCommandMenuContextApi derives isInSidePanel
  // as false. The explicit prop from the caller is the source of truth.
  const commandMenuContextApi = isInSidePanel
    ? { ...commandMenuContextApiFromHook, isInSidePanel: true as const }
    : commandMenuContextApiFromHook;

  const currentObjectNameSingular =
    commandMenuContextApi.objectMetadataItem.nameSingular;

  const isWorkflow =
    currentObjectNameSingular === CoreObjectNameSingular.Workflow;

  const selectedWorkflowRecordIds = isWorkflow
    ? commandMenuContextApi.selectedRecords
        .map((record) => record.id)
        .filter(isDefined)
    : [];

  if (selectedWorkflowRecordIds.length > 0) {
    return (
      <CommandMenuContextProviderServerItemsWithWorkflowEnrichment
        isInSidePanel={isInSidePanel}
        displayType={displayType}
        containerType={containerType}
        commandMenuContextApi={commandMenuContextApi}
        selectedWorkflowRecordIds={selectedWorkflowRecordIds}
      >
        {children}
      </CommandMenuContextProviderServerItemsWithWorkflowEnrichment>
    );
  }

  return (
    <CommandMenuContextProviderServerItemsContent
      isInSidePanel={isInSidePanel}
      displayType={displayType}
      containerType={containerType}
      commandMenuContextApi={commandMenuContextApi}
    >
      {children}
    </CommandMenuContextProviderServerItemsContent>
  );
};
