import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCoreWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions';
import { useWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useWorkflowsWithCurrentVersions';

import { CommandMenuContextProviderContent } from './CommandMenuContextProviderContent';

type CommandMenuContextProviderWithWorkflowEnrichmentProps = {
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
  commandMenuContextApi: CommandMenuContextApi;
  selectedWorkflowRecordIds: string[];
  isInPreviewMode: boolean;
};

export const CommandMenuContextProviderWithWorkflowEnrichment = ({
  displayType,
  containerType,
  children,
  commandMenuContextApi,
  selectedWorkflowRecordIds,
  isInPreviewMode,
}: CommandMenuContextProviderWithWorkflowEnrichmentProps) => {
  const { workflows: coreWorkflowsWithCurrentVersions, isCoreDataComplete } =
    useCoreWorkflowsWithCurrentVersions(selectedWorkflowRecordIds);

  const workspaceWorkflowsWithCurrentVersions = useWorkflowsWithCurrentVersions(
    isCoreDataComplete ? [] : selectedWorkflowRecordIds,
  );

  const workflowsWithCurrentVersions = isCoreDataComplete
    ? coreWorkflowsWithCurrentVersions
    : workspaceWorkflowsWithCurrentVersions;

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
        lastPublishedVersionId:
          workflowWithCurrentVersion.lastPublishedVersionId,
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
      isInPreviewMode={isInPreviewMode}
    >
      {children}
    </CommandMenuContextProviderContent>
  );
};
