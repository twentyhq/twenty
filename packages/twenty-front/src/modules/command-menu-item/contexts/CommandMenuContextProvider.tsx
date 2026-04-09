import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuContextApi } from '@/command-menu-item/hooks/useCommandMenuContextApi';

import { CommandMenuContextProviderContent } from './CommandMenuContextProviderContent';
import { CommandMenuContextProviderWithWorkflowEnrichment } from './CommandMenuContextProviderWithWorkflowEnrichment';

type CommandMenuContextProviderProps = {
  isInSidePanel: boolean;
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
};

export const CommandMenuContextProvider = ({
  isInSidePanel,
  displayType,
  containerType,
  children,
}: CommandMenuContextProviderProps) => {
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
      <CommandMenuContextProviderWithWorkflowEnrichment
        displayType={displayType}
        containerType={containerType}
        commandMenuContextApi={commandMenuContextApi}
        selectedWorkflowRecordIds={selectedWorkflowRecordIds}
      >
        {children}
      </CommandMenuContextProviderWithWorkflowEnrichment>
    );
  }

  return (
    <CommandMenuContextProviderContent
      displayType={displayType}
      containerType={containerType}
      commandMenuContextApi={commandMenuContextApi}
    >
      {children}
    </CommandMenuContextProviderContent>
  );
};
