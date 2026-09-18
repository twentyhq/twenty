import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { CoreWorkflowsWithCurrentVersionsLoader } from '@/command-menu-item/components/CoreWorkflowsWithCurrentVersionsLoader';
import { useWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useWorkflowsWithCurrentVersions';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';

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
  const isCore = useIsWorkflowCoreEnabled();
  const workflowsWithCurrentVersions = useWorkflowsWithCurrentVersions(
    isCore ? [] : selectedWorkflowRecordIds,
  );

  const renderProvider = (
    workflows: WorkflowWithCurrentVersion[],
  ): React.ReactNode => {
    const enrichedSelectedRecords = commandMenuContextApi.selectedRecords.map(
      (record) => {
        const workflowWithCurrentVersion = workflows.find(
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

  return isCore ? (
    <CoreWorkflowsWithCurrentVersionsLoader
      workflowIds={selectedWorkflowRecordIds}
    >
      {renderProvider}
    </CoreWorkflowsWithCurrentVersionsLoader>
  ) : (
    renderProvider(workflowsWithCurrentVersions)
  );
};
