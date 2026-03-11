import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCommandMenuContextApi } from '@/command-menu-item/server-items/hooks/useCommandMenuContextApi';
import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';

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
  const commandMenuContextApi = useCommandMenuContextApi();

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
