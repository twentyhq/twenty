import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useWorkflowsWithCurrentVersions';

import { CommandMenuContextProviderContent } from './CommandMenuContextProviderContent';

type CommandMenuContextProviderWithWorkflowEnrichmentProps = {
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
  commandMenuContextApi: CommandMenuContextApi;
  selectedWorkflowRecordIds: string[];
};

export const CommandMenuContextProviderWithWorkflowEnrichment = ({
  displayType,
  containerType,
  children,
  commandMenuContextApi,
  selectedWorkflowRecordIds,
}: CommandMenuContextProviderWithWorkflowEnrichmentProps) => {
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
    <CommandMenuContextProviderContent
      displayType={displayType}
      containerType={containerType}
      commandMenuContextApi={enrichedCommandMenuContextApi}
    >
      {children}
    </CommandMenuContextProviderContent>
  );
};
