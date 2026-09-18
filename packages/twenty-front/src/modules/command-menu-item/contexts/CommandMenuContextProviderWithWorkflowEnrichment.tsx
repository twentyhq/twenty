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

type EnrichedWorkflowCommandMenuContextProviderProps = Omit<
  CommandMenuContextProviderWithWorkflowEnrichmentProps,
  'selectedWorkflowRecordIds'
> & {
  workflows: WorkflowWithCurrentVersion[];
};

const EnrichedWorkflowCommandMenuContextProvider = ({
  displayType,
  containerType,
  children,
  commandMenuContextApi,
  isInPreviewMode,
  workflows,
}: EnrichedWorkflowCommandMenuContextProviderProps) => {
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

  return (
    <CommandMenuContextProviderContent
      displayType={displayType}
      containerType={containerType}
      commandMenuContextApi={{
        ...commandMenuContextApi,
        selectedRecords: enrichedSelectedRecords,
      }}
      isInPreviewMode={isInPreviewMode}
    >
      {children}
    </CommandMenuContextProviderContent>
  );
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

  return isCore ? (
    <CoreWorkflowsWithCurrentVersionsLoader
      workflowIds={selectedWorkflowRecordIds}
    >
      {(workflows) => (
        <EnrichedWorkflowCommandMenuContextProvider
          displayType={displayType}
          containerType={containerType}
          commandMenuContextApi={commandMenuContextApi}
          isInPreviewMode={isInPreviewMode}
          workflows={workflows}
        >
          {children}
        </EnrichedWorkflowCommandMenuContextProvider>
      )}
    </CoreWorkflowsWithCurrentVersionsLoader>
  ) : (
    <EnrichedWorkflowCommandMenuContextProvider
      displayType={displayType}
      containerType={containerType}
      commandMenuContextApi={commandMenuContextApi}
      isInPreviewMode={isInPreviewMode}
      workflows={workflowsWithCurrentVersions}
    >
      {children}
    </EnrichedWorkflowCommandMenuContextProvider>
  );
};
