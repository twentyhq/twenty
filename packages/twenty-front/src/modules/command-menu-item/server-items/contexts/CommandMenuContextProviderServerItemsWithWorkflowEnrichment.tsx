import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuContextProviderServerItemsContent } from './CommandMenuContextProviderServerItemsContent';

type CommandMenuContextProviderServerItemsWithWorkflowEnrichmentProps = {
  isInSidePanel: CommandMenuContextType['isInSidePanel'];
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
};

export const CommandMenuContextProviderServerItemsWithWorkflowEnrichment = ({
  isInSidePanel,
  displayType,
  containerType,
  children,
  commandMenuContextApi,
  selectedWorkflowRecordId,
}: CommandMenuContextProviderServerItemsWithWorkflowEnrichmentProps & {
  commandMenuContextApi: CommandMenuContextApi;
  selectedWorkflowRecordId: string;
}) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    selectedWorkflowRecordId,
  );

  const enrichedSelectedRecords = isDefined(workflowWithCurrentVersion)
    ? commandMenuContextApi.selectedRecords.map((record) =>
        record.id === workflowWithCurrentVersion.id
          ? {
              ...record,
              currentVersion: workflowWithCurrentVersion.currentVersion,
              versions: workflowWithCurrentVersion.versions,
              statuses: workflowWithCurrentVersion.statuses,
            }
          : record,
      )
    : commandMenuContextApi.selectedRecords;

  const enrichedCommandMenuContextApi = {
    ...commandMenuContextApi,
    selectedRecords: enrichedSelectedRecords,
  };

  return (
    <CommandMenuContextProviderServerItemsContent
      isInSidePanel={isInSidePanel}
      displayType={displayType}
      containerType={containerType}
      commandMenuContextApi={enrichedCommandMenuContextApi}
    >
      {children}
    </CommandMenuContextProviderServerItemsContent>
  );
};
