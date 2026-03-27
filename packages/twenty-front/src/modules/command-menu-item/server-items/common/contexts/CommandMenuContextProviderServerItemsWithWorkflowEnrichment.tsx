import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useWorkflowsWithCurrentVersions } from '@/command-menu-item/server-items/common/hooks/useWorkflowsWithCurrentVersions';

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
  selectedWorkflowRecordIds,
}: CommandMenuContextProviderServerItemsWithWorkflowEnrichmentProps & {
  commandMenuContextApi: CommandMenuContextApi;
  selectedWorkflowRecordIds: string[];
}) => {
  const workflowsWithCurrentVersions = useWorkflowsWithCurrentVersions(
    selectedWorkflowRecordIds,
  );

  const enrichedSelectedRecords = commandMenuContextApi.selectedRecords.map(
    (record) => {
      const workflowWithCurrentVersion = workflowsWithCurrentVersions.find(
        (workflow) => workflow.id === record.id,
      );

      if (!isDefined(workflowWithCurrentVersion)) {
        return record;
      }

      return {
        ...record,
        currentVersion: workflowWithCurrentVersion.currentVersion,
        versions: workflowWithCurrentVersion.versions,
        statuses: workflowWithCurrentVersion.statuses,
      };
    },
  );

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
