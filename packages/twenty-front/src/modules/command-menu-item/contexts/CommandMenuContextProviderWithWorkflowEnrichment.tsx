import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCoreWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions';
import { useWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useWorkflowsWithCurrentVersions';
import { type CoreWorkflowWithCurrentVersion } from '@/object-core/workflows/types/CoreWorkflowWithCurrentVersion';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';

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
  const coreWorkflowsWithCurrentVersions = useCoreWorkflowsWithCurrentVersions(
    isCore ? selectedWorkflowRecordIds : [],
  );

  const workflows: (WorkflowWithCurrentVersion &
    Partial<
      Pick<CoreWorkflowWithCurrentVersion, 'visibility' | 'canChangeVisibility'>
    >)[] = isCore
    ? coreWorkflowsWithCurrentVersions
    : workflowsWithCurrentVersions;

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
        visibility: workflowWithCurrentVersion.visibility,
        canChangeVisibility: workflowWithCurrentVersion.canChangeVisibility,
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
