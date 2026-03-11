import { useCommandMenuContextApi } from '@/command-menu-item/server-items/hooks/useCommandMenuContextApi';
import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

  const selectedWorkflowRecordId =
    currentObjectNameSingular === CoreObjectNameSingular.Workflow &&
    commandMenuContextApi.selectedRecords.length === 1
      ? commandMenuContextApi.selectedRecords[0]?.id
      : undefined;

  if (isDefined(selectedWorkflowRecordId)) {
    return (
      <CommandMenuContextProviderServerItemsWithWorkflowEnrichment
        isInSidePanel={isInSidePanel}
        displayType={displayType}
        containerType={containerType}
        commandMenuContextApi={commandMenuContextApi}
        selectedWorkflowRecordId={selectedWorkflowRecordId}
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
